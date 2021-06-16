import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-business-details',
  templateUrl: './business-details.page.html',
  styleUrls: ['./business-details.page.scss'],
})
export class BusinessDetailsPage implements OnInit {

  business: IBusiness = null;
  employees: IEmployee[] = [];

  employees$: Subscription;
  constructor(private utilityService: UtilityService, 
    private angularFireDatabase: AngularFireDatabase,
    private geolocation: Geolocation,
    private router: Router) {
  }

  ngOnInit() {
    const navigationExtras = this.router.getCurrentNavigation().extras.state?.business;
    if(navigationExtras != null) this.business = navigationExtras;
    else this.router.navigate(['/dashboard']);
    
    let currentLocation = this.geolocation.getCurrentPosition();
    currentLocation.then((location: Geoposition)=>{
      this.initMap(location.coords.latitude, location.coords.longitude)
    });
    this.getEmployees(); 
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

  initMap(latitude: number, longitude:number):void{
    MapBox.accessToken = environment.mapToken;
    const initLong = this.business.long;
    const initLat = this.business.latitude;

    const map = new MapBox.Map({
      container: 'map-box',
      style: 'mapbox://styles/mapbox/streets-v11', 
      center: [initLong, initLat], 
      zoom: 15,
    });
    const marker = new MapBox.Marker().setLngLat([initLong, initLat]).addTo(map);
    const clientMarker = new MapBox.Marker({color: 'red'}).setLngLat([longitude, latitude]).addTo(map);
    map.addControl(new MapBox.NavigationControl());
    map.scrollZoom.disable()
  }

  async openReserveModal(employee: IEmployee){
    this.utilityService.setBusinessName(this.business.businessName);
    await this.utilityService.openModal(EmployeeDetailsComponent, employee, this.business.key);
  }

  goToPage(page: string){
    this.router.navigate([page]);
  }

  ionViewWillLeave() {
    this.employees$.unsubscribe();
  }

}
