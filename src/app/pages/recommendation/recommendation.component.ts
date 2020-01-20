import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.scss']
})
export class RecommendationComponent implements OnInit {

  destination: object;
  currentPosition = {lat: undefined, long: undefined};
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.destination = JSON.parse(this.route.snapshot.queryParamMap.get('destination'));
    console.log(this.destination);
    if (navigator.geolocation) {
      console.log("here")
      navigator.geolocation.getCurrentPosition(position => {
        console.log(position)
        this.currentPosition.lat = position.coords.latitude;
        this.currentPosition.long = position.coords.longitude;
      }, error => {
        console.log(error)
      }, {enableHighAccuracy: true})
    } else {
      alert("Geolocation is not supported by this browser.");
    }

    

  }

}
