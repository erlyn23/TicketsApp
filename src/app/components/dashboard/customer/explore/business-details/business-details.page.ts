import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IBusiness } from 'src/app/core/models/business.interface';
import * as MapBox from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import { IEmployee } from 'src/app/core/models/employee.interface';
import { UtilityService } from 'src/app/services/utility.service';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-business-details',
  templateUrl: './business-details.page.html',
  styleUrls: ['./business-details.page.scss'],
})
export class BusinessDetailsPage implements OnInit, OnDestroy {

  business: IBusiness = null;
  employees: IEmployee[] = [];

  employees$: Subscription;

  backOrigin: string;

  constructor(private utilityService: UtilityService, 
    private angularFireDatabase: AngularFireDatabase,
    private platform: Platform,
    private geolocation: Geolocation,
    private router: Router) {
      this.platform.backButton.subscribeWithPriority(7, ()=>{
        const navigationExtras = this.router.getCurrentNavigation().extras.state?.origin;
        this.backOrigin = navigationExtras;
        if(navigationExtras != null){
          switch(navigationExtras)
          {
            case 'explore':
              this.router.navigate(['dashboard/explore']);  
            break;
            case 'home':
              this.router.navigate(['dashboard/home']);
            break;
            case 'favourites':
              this.router.navigate(['favourites']);
            break;
            case 'reserves':
              this.router.navigate(['dashboard/turns']);
            break;
          }
        }
      });
  }

  ngOnInit() {
    
    const navigationExtras = this.router.getCurrentNavigation().extras.state?.business;
    
    const backOrigin = this.router.getCurrentNavigation().extras.state?.origin;
    this.backOrigin = backOrigin;
    
    if(navigationExtras != null) this.business = navigationExtras;
    else this.goToDashboard();
    
    if(this.business !== null){
      let currentLocation = this.geolocation.getCurrentPosition();
      currentLocation.then((location: Geoposition)=>{
        this.initMap(location.coords.latitude, location.coords.longitude)
      });
    }else this.goToDashboard();
    
    this.getEmployees(); 
  }

  map: MapBox.Map;
  initMap(latitude: number, longitude:number){
    MapBox.accessToken = environment.mapToken;
    const initLong = this.business.long;
    const initLat = this.business.latitude;

    let newMapContent = document.createElement('div');
    newMapContent.id = 'map-content';
    newMapContent.innerHTML = "&nbsp;";
    newMapContent.style.height = '400px';
    document.getElementById('page-content')?.appendChild(newMapContent);

    this.map = new MapBox.Map({
      container: 'map-content',
      style: 'mapbox://styles/mapbox/streets-v11', 
      center: [initLong, initLat], 
      zoom: 15,
    });
    this.map.on('load', ()=>{
      const marker = new MapBox.Marker().setLngLat([initLong, initLat]).addTo(this.map);
      const clientMarker = new MapBox.Marker({color: 'red'}).setLngLat([longitude, latitude]).addTo(this.map);
      this.map.addControl(new MapBox.NavigationControl());
      this.map.scrollZoom.disable();
    });
  }

  goToDashboard(){
    this.router.navigate(['/dashboard']);
  }

  getEmployees(){
    const employeesObject: AngularFireObject<IEmployee[]> = this.angularFireDatabase.object(`businessList/${this.business.key}/employees`);
    this.employees$ = employeesObject.snapshotChanges().subscribe(result=>{
      const data = result.payload.val();

      this.employees = [];
      for(let employeeKey in data){
        data[employeeKey].key = employeeKey;
        this.employees.push(data[employeeKey]);
      }
    });
  }

  async openReserveModal(employee: IEmployee){
    this.utilityService.setBusinessName(this.business.businessName);
    await this.utilityService.openModal(EmployeeDetailsComponent, employee, this.business.key);
  }

  goToPage(){
      switch(this.backOrigin)
      {
        case 'explore':
          this.router.navigate(['dashboard/explore']);  
        break;
        case 'home':
          this.router.navigate(['dashboard/home']);
        break;
        case 'favourites':
          this.router.navigate(['favourites']);
        break;
        case 'reserves':
          this.router.navigate(['dashboard/turns']);
        break;
      }
  }

  ngOnDestroy(){
    this.employees$?.unsubscribe();
  }

}
