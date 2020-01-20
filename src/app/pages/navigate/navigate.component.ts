import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MapsService } from 'app/services/maps.service';

interface Position {
  lat: number,
  long: number
}
declare var google: any;

@Component({
  selector: 'app-navigate',
  templateUrl: './navigate.component.html',
  styleUrls: ['./navigate.component.scss']
})
export class NavigateComponent implements OnInit, AfterViewInit {

  currentPosition: Position = {lat: undefined, long: undefined};
  origin: Position = {lat: undefined, long: undefined}
  destination: Position = {lat: undefined, long: undefined}
  directionsService;
  directionsRenderer;
  navigateURL: string;
  directionsLoaded = false;
  locationClicked = false;
  constructor(private mapsService: MapsService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (navigator.geolocation) {
      console.log("here")
      navigator.geolocation.getCurrentPosition(position => {
        console.log(position)
        this.currentPosition.lat = position.coords.latitude;
        this.currentPosition.long = position.coords.longitude;
        this.initializeMap();
      }, error => {
        console.log(error)
      }, {enableHighAccuracy: true})
    } else {
      alert("Geolocation is not supported by this browser.");
    }

    this.initializeAutocomplete();

  }

  initializeMap() {

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();

    var myLatlng = new google.maps.LatLng(this.currentPosition.lat, this.currentPosition.long);
    var mapOptions = {
      zoom: 13,
      center: myLatlng,
      scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
      styles: [{"featureType":"water","stylers":[{"saturation":43},{"lightness":-11},{"hue":"#0088ff"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":99}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#808080"},{"lightness":54}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ece2d9"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#ccdca1"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#767676"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b8cb93"}]},{"featureType":"poi.park","stylers":[{"visibility":"on"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"simplified"}]}]

    }
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    this.directionsRenderer.setMap(map);

  }


  initializeAutocomplete() {
    var origin_input = document.getElementById('origin-autocomplete');
      var origin_autocomplete = new google.maps.places.Autocomplete(origin_input);
      google.maps.event.addListener(origin_autocomplete, 'place_changed', () => {
         var place = origin_autocomplete.getPlace();
         this.origin.lat = place.geometry.location.lat();
         this.origin.long = place.geometry.location.lng();
      })


    var destination_input = document.getElementById('destination-autocomplete');
    var destination_autocomplete = new google.maps.places.Autocomplete(destination_input);
    google.maps.event.addListener(destination_autocomplete, 'place_changed', () => {
        var place = destination_autocomplete.getPlace();
        this.destination.lat = place.geometry.location.lat();
        this.destination.long = place.geometry.location.lng();
    })
  }


  getDirections() {
    var start = new google.maps.LatLng(this.origin.lat, this.origin.long)
    var end =  new google.maps.LatLng(this.destination.lat, this.destination.long)
    var request = {
      origin: start,
      destination: end,
      travelMode: 'DRIVING',
      drivingOptions: {
        departureTime: new Date(Date.now())
      }
    };
    this.directionsService.route(request, (result, status) => {
      if (status == 'OK') {
        console.log(result)
        this.directionsRenderer.setDirections(result);
        this.directionsLoaded = true;
        this.navigateURL = `https://www.google.com/maps/dir/?api=1&origin=${this.origin.lat},${this.origin.long}&destination=${this.destination.lat},${this.destination.long}&travelmode=driving&dir_action=navigate`;

        this.mapsService.subscribeToNotification(this.destination);
      }
    });
  }

  setCurrentLocation() {
    this.locationClicked = !this.locationClicked;
    var origin_input = document.getElementById('origin-autocomplete');
    if(this.locationClicked) {
      origin_input['value'] = "Your Location"
      origin_input['disabled'] = true;
      this.origin = {...this.currentPosition};
    } else {
      origin_input['value'] = "";
      origin_input['disabled'] = false;
      
    }

  }

}
