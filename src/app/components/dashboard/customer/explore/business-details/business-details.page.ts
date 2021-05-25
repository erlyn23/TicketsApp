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
    private router: Router) {
  }

  ngOnInit() {
    const navigationExtras = this.router.getCurrentNavigation().extras.state?.business;
    if(navigationExtras != null) this.business = navigationExtras;
    else this.router.navigate(['/dashboard']);
    
    this.initMap();
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

  initMap():void{
    MapBox.accessToken = environment.mapToken;
    const initLong = this.business.long;
    const initLat = this.business.latitude;

    const map = new MapBox.Map({
      container: 'mapbox-container',
      style: 'mapbox://styles/mapbox/streets-v11', 
      center: [initLong, initLat], 
      zoom: 15,
    });
    const marker = new MapBox.Marker().setLngLat([initLong, initLat]).addTo(map);
    
    map.addControl(new MapBox.NavigationControl());
    map.scrollZoom.disable()
  }

  async openReserveModal(employee: IEmployee){
    await this.utilityService.openModal(EmployeeDetailsComponent, employee, this.business.key);
  }

  goToPage(page: string){
    this.router.navigate([page]);
  }

  ionViewWillLeave() {
    this.employees$.unsubscribe();
  }

}
