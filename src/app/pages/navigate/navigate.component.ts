import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-navigate',
  templateUrl: './navigate.component.html',
  styleUrls: ['./navigate.component.scss']
})
export class NavigateComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (navigator.geolocation) {
      console.log("here")
      navigator.geolocation.getCurrentPosition(position => {
        console.log(position)
      }, error => {
        console.log(error)
      }, {enableHighAccuracy: true})
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

}
