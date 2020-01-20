import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MapsService {

  constructor(private socket: Socket, private swPush: SwPush, private http: HttpClient) { }

  readonly VAPID_PUBLIC_KEY = "BHSpRNHScI75d93g647Y4iJyVVlM_oroyj8oo3WJQUkD_B1Ahy177qCKtNrXVSmqN364A_d0tW81mspn2FA7TEY";

  subscribeToNotification(destinationObj) {
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
  })
  .then(sub => {this.addPushSubscriber(sub).subscribe()})
  .catch(err => console.error("Could not subscribe to notifications", err));

  this.addsubscriber(destinationObj);
  }

  addsubscriber(destinationObj) {
    this.swPush.messages.subscribe(
      (notification: any) => {
        console.log("received push message", notification);

        // let options = {
        // "body": "Low Fuel has been detected",
        // "icon": "",
        // "vibrate": [100, 50, 100],
        // "data": {
        //     "dateOfArrival": Date.now(),
        //     "primaryKey": 1
        // }
        // };
        // this.showNotifications("Low Fuel Alert", options
        if(window.location.hostname === "localhost")
          window.open(`http://localhost:4200/#/recommendation/?destination=${JSON.stringify(destinationObj)}`, '_self')
        else  
        window.open(`/#/recommendation/?destination=${JSON.stringify(destinationObj)}`, '_self')
      },

      err => {
        console.error(err);
      }
    );

    this.swPush.notificationClicks.subscribe(e => {
      window.focus();
      if(window.location.hostname === "localhost")
          window.open(`http://localhost:4200/#/recommendation/?destination=${JSON.stringify(destinationObj)}`, '_self')
        else  
      window.open(`/#/recommendation/?destination=${JSON.stringify(destinationObj)}`, '_self')
    })
  }

  showNotifications(title, options) {
    navigator.serviceWorker.getRegistration().then(reg => {
      console.log(reg)
      reg.showNotification(title, options).then(res => {
        console.log("showed notification", res)
      }, err => {
        console.error(err)
      });
    });
  }

  addPushSubscriber(sub) {
    return this.http.post("https://infinite-peak-35695.herokuapp.com/pushNotification", sub);
  }


  recommendation(info) {
    function compare(a,b) {
      if(a.waitTime == b.waitTime){
        if(a.distance == b.distance){
          return b.rating - a.rating;
        }
        else return a.distance - b.distance;
      }
      else return a.waitTime - b.waitTime;
    }
    
    function getDistance(lat1, lat2, lng1, lng2) {
      const deg2rad = (deg => deg*(Math.PI/180)); 
        const earthRadius = 6371e3;
    
        var deltaLat = deg2rad(Math.abs(lat1-lat2));
        var deltaLong = deg2rad(Math.abs(lng1-lng2));
    
        var a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(deltaLong/2) * Math.sin(deltaLong/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return c*earthRadius;
    }
    
    // info = request format {"currLat":30,"currLong":40,"statList":[{"Pump_id":8,"latitude":5,"longitude":10,"waitTime":15,"ratings":4.6}]}
    
    
    var currentLatitude = info.currLat;
    var currentLongitude = info.currLong;
    var stationList = info.statList;
    for(var i=0;i<stationList.length;i++){
      stationList[i]["distance"] = getDistance(currentLatitude,stationList[i].latitude,currentLongitude, stationList[i].longitude)
    }
    
    stationList.sort(compare);
  }

  connect() {
    this.socket.connect();

    this.socket.on('lowFuelEvent', () => {
      console.log('received event');
      window.focus();
      alert();
    });
  }

}
