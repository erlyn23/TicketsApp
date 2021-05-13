import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { HeaderComponent } from '../core/header/header.component';
import { HomeComponent } from './customer/home/home.component';
import { ExploreComponent } from './customer/explore/explore.component';
import { MapModule } from 'src/app/core/modules/map.module';
import { BHomeComponent } from './business/b-home/b-home.component';
import { BrowserModule } from '@angular/platform-browser';
import { EmployeesComponent } from './business/employees/employees.component';

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
    HeaderComponent, 
    HomeComponent,
    ExploreComponent,
    BHomeComponent,
    EmployeesComponent ]
})
export class DashboardPageModule {}
