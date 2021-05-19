import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { HomeComponent } from './customer/home/home.component';
import { ExploreComponent } from './customer/explore/explore.component';
import { MapModule } from 'src/app/core/modules/map.module';
import { BHomeComponent } from './business/b-home/b-home.component';
import { EmployeesComponent } from './business/employees/employees.component';
import { AddEmployeeComponent } from './business/employees/add-employee/add-employee.component';
import { BEmployeeDetailsComponent } from './business/employees/b-employee-details/b-employee-details.component';
import { BProfileComponent } from './business/b-profile/b-profile.component';
import { ChangePasswordComponent } from '../core/change-password/change-password.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    MapModule
  ],
  declarations: [DashboardPage,
    HomeComponent,
    ExploreComponent,
    BHomeComponent,
    EmployeesComponent,
    AddEmployeeComponent,
    BEmployeeDetailsComponent,
    BProfileComponent,
    ChangePasswordComponent]
})
export class DashboardPageModule {}
