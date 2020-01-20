import { Component,OnInit } from '@angular/core';

declare var google: any;

@Component({
    moduleId: module.id,
    selector: 'maps-cmp',
    templateUrl: 'maps.component.html'
})


export class MapsComponent implements OnInit {

    currentLat = 40.748817;
    currentLong = -73.985428;
    standardRadius = 2000; //In Metres
    map: any;
    markers = [];
    
    getPosition(): Promise<any> {
        return new Promise((resolve, reject) => {

        navigator.geolocation.getCurrentPosition(resp => {

            resolve({lng: resp.coords.longitude, lat: resp.coords.latitude});
            },
            err => {
            resolve({lng: this.currentLong, lat: this.currentLat});
            });
        });
    }

    initializeMap() {
        
        var myLatlng = new google.maps.LatLng(this.currentLat, this.currentLong);

        var mapOptions = {
        zoom: 13,
        center: myLatlng,
        scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
        styles: [{"featureType":"water","stylers":[{"saturation":43},{"lightness":-11},{"hue":"#0088ff"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":99}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#808080"},{"lightness":54}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ece2d9"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#ccdca1"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#767676"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b8cb93"}]},{"featureType":"poi.park","stylers":[{"visibility":"on"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"simplified"}]}]

        }
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
        
        var marker = new google.maps.Marker({
            position: myLatlng,
            title:"Hello World!"
        });

        // To add the marker to the map, call setMap();
        this.markers.push(marker);
        marker.setMap(map);
        return map;   
    }

    initializeGasStations(map: any){

        var myLatlng = new google.maps.LatLng(this.currentLat, this.currentLong)

        //Add Gas Stations to the map
        var request =  {
            radius: this.standardRadius,
            type: ['gas_station'],
            location: myLatlng
        };

        var service = new google.maps.places.PlacesService(map);
        var infowindow = new google.maps.InfoWindow();

        service.textSearch(request, (results, status) => {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                var place = results[i];

                var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                });

                this.markers.push(marker);

                google.maps.event.addListener(marker, 'click', function() {
                    let content = `<div>Name: ${place.name}</div>
                                <div>Address: ${place.formatted_address}</div>
                                <div>Rating: ${place.rating}</div>
                                <div>Total Ratings: ${place.user_ratings_total}</div>`;
                    infowindow.setContent(content);
                    infowindow.open(map, this);
                });
                }
            }
        });
    }

    getDistance(newLat: number, newLong: number): Promise<any> {
        return new Promise((resolve, reject) => {
            const deg2rad = (deg => deg*(Math.PI/180)); 
            const earthRadius = 6371e3;
            var oldLat = this.currentLat;
            var oldLong = this.currentLong;

            var deltaLat = deg2rad(newLat-oldLat);
            var deltaLong = deg2rad(newLong-oldLong);

            var a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                    Math.cos(deg2rad(oldLat)) * Math.cos(deg2rad(newLat)) *
                    Math.sin(deltaLong/2) * Math.sin(deltaLong/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            resolve(c*earthRadius);
        });
    }

    async ngOnInit() {
        
        var coords = await this.getPosition();
        this.currentLat = coords.lat;
        this.currentLong = coords.lng;

        var map = this.initializeMap();
        this.initializeGasStations(map);

        //Remove markers except current location
        google.maps.Map.prototype.clearOverlays = () => {
            for (var i = 1; i < this.markers.length; i++ ) {
              this.markers[i].setMap(null);
            }
            this.markers.length = 1;
          }

        //Center Change
        google.maps.event.addListener(map, 'dragend', async () => {
            var newLat = map.getCenter().lat();
            var newLong = map.getCenter().lng();
            var newDistance = await this.getDistance(newLat, newLong);   
            
            // Recall api if distance > 2km
            if(newDistance > this.standardRadius) {
                this.currentLat =  newLat;
                this.currentLong = newLong;
                
                map.clearOverlays();
                this.initializeGasStations(map);
            } 
        });
        

    }
    
}
