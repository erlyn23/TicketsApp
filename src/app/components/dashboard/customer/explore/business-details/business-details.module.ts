import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BusinessDetailsPageRoutingModule } from './business-details-routing.module';

import { BusinessDetailsPage } from './business-details.page';
import { MapModule } from 'src/app/core/modules/map.module';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BusinessDetailsPageRoutingModule,
    MapModule
  ],
  declarations: [BusinessDetailsPage, 
    EmployeeDetailsComponent]
})
export class BusinessDetailsPageModule {}
