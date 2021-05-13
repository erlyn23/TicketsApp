import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { HeaderComponent } from '../core/header/header.component';
import { HomeComponent } from './customer/home/home.component';
import { ExploreComponent } from './customer/explore/explore.component';
import { MapComponent } from '../core/map/map.component';
import { RegisterBusinessComponent } from '../auth/register/register-business/register-business.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DashboardPageRoutingModule
  ],
  declarations: [DashboardPage, 
    HeaderComponent, 
    HomeComponent,
    ExploreComponent,
    MapComponent,
    RegisterBusinessComponent ]
})
export class DashboardPageModule {}
