import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BHomeComponent } from './business/b-home/b-home.component';
import { BProfileComponent } from './business/b-profile/b-profile.component';
import { EmployeesComponent } from './business/employees/employees.component';
import { ExploreComponent } from './customer/explore/explore.component';
import { FavouritesComponent } from './customer/favourites/favourites.component';
import { HomeComponent } from './customer/home/home.component';
import { ProfileComponent } from './customer/profile/profile.component';

import { DashboardPage } from './dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'explore',
        component: ExploreComponent,
      },
      {
        path: 'favourites',
        component: FavouritesComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'b-home',
        component: BHomeComponent
      },
      {
        path: 'employees',
        component: EmployeesComponent,
      },
      {
        path: 'b-profile',
        component: BProfileComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule {}
