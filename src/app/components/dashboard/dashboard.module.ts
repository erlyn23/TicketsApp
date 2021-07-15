import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { ProfileComponent } from './customer/profile/profile.component';
import { FavouritesComponent } from './customer/favourites/favourites.component';
import { PhotoPopoverComponent } from '../core/photo-popover/photo-popover.component';
import { UpdateEmployeeComponent } from './business/employees/update-employee/update-employee.component';
import { ServicesComponent } from './business/services/services.component';
import { AddServiceComponent } from './business/services/add-service/add-service.component';
import { UpdateServiceComponent } from './business/services/update-service/update-service.component';
import { TurnsComponent } from './customer/turns/turns.component';
import { EditAccountComponent } from './customer/profile/edit-account/edit-account.component';
import { HelpComponent } from './customer/profile/help/help.component';

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
    ProfileComponent,
    ExploreComponent,
    FavouritesComponent,
    BHomeComponent,
    EmployeesComponent,
    AddEmployeeComponent,
    UpdateEmployeeComponent,
    ServicesComponent,
    AddServiceComponent,
    UpdateServiceComponent,
    BEmployeeDetailsComponent,
    BProfileComponent,
    PhotoPopoverComponent,
    ChangePasswordComponent,
    TurnsComponent,
    EditAccountComponent,
    HelpComponent
    ]
})
export class DashboardPageModule {}
