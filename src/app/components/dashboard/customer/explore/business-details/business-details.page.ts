import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IBusiness } from 'src/app/core/models/business.interface';
import * as MapBox from 'mapbox-gl';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-business-details',
  templateUrl: './business-details.page.html',
  styleUrls: ['./business-details.page.scss'],
})
export class BusinessDetailsPage implements OnInit {

  business: IBusiness = null;
  constructor(private router: Router) {
  }

  ngOnInit() {
    const navigationExtras = this.router.getCurrentNavigation().extras.state?.business;
    if(navigationExtras != null) this.business = navigationExtras;
    else this.router.navigate(['/dashboard']);

    this.initMap();
  }

  initMap():void{
    MapBox.accessToken = environment.mapToken;
    const initLong = this.business.long;
    const initLat = this.business.latitude;

    const map = new MapBox.Map({
      container: 'mapbox-container',
      style: 'mapbox://styles/mapbox/streets-v11', 
      center: [initLong, initLat], 
      zoom: 9,
    });
    const marker = new MapBox.Marker().setLngLat([initLong, initLat]).addTo(map);
    
    map.addControl(new MapBox.NavigationControl());
    map.scrollZoom.disable()
  }

  goToPage(page: string){
    this.router.navigate([page]);
  }

}
