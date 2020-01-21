import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MapsService } from 'app/services/maps.service';
import { take } from 'rxjs/operators'

declare var google: any;
@Component({
  selector: 'app-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.scss']
})
export class RecommendationComponent implements OnInit {

  destination = {lat: undefined, long: undefined};
  currentPosition = {lat: undefined, long: undefined};
  standardRadius = 2000;
  constructor(private route: ActivatedRoute, private mapsService: MapsService) { }

  ngOnInit() {
    this.destination = JSON.parse(this.route.snapshot.queryParamMap.get('destination'));
    // this.destination = {lat: 28.000, long: 72.000}
    console.log(this.destination);
    if (navigator.geolocation) {
      console.log("here")
      navigator.geolocation.getCurrentPosition(position => {
        console.log(position)
        this.currentPosition.lat = position.coords.latitude;
        this.currentPosition.long = position.coords.longitude;
        this.getRecommendation()
      }, error => {
        console.log(error)
      }, {enableHighAccuracy: true})
    } else {
      alert("Geolocation is not supported by this browser.");
    }

  }

  getRecommendation(){
    this.mapsService.map = this.initializeMap();
    this.mapsService.getRecommendation(this.currentPosition, this.destination)
    this.mapsService.suggestedEmitter.pipe(take(1)).subscribe(suggested => {
      console.log(suggested);
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${this.currentPosition.lat},${this.currentPosition.long}&destination=${this.destination.lat},${this.destination.long}&travelmode=driving&dir_action=navigate&waypoints=${suggested["latitude"]},${suggested['longitude']}`)
    })
  }

  initializeMap() {

    var myLatlng = new google.maps.LatLng(this.currentPosition.lat, this.currentPosition.long);
    var mapOptions = {
      zoom: 13,
      center: myLatlng,
      scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
      styles: [{"featureType":"water","stylers":[{"saturation":43},{"lightness":-11},{"hue":"#0088ff"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":99}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#808080"},{"lightness":54}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ece2d9"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#ccdca1"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#767676"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b8cb93"}]},{"featureType":"poi.park","stylers":[{"visibility":"on"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"simplified"}]}]

    }
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    return map;
  }

}
