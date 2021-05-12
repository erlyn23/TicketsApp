import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-slide',
  templateUrl: './main-slide.component.html',
  styleUrls: ['./main-slide.component.scss'],
})
export class MainSlideComponent implements OnInit {

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    autoplay: true
  };
  constructor() { }

  ngOnInit() {
  }

}
