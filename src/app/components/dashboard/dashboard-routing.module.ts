import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
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
    canActivate: [AuthGuard],
    component: DashboardPage,
    children: [
      {
        path: 'home',
        canActivate: [AuthGuard],
        component: HomeComponent
      },
      {
        path: 'explore',
        canActivate: [AuthGuard],
        component: ExploreComponent,
      },
      {
        path: 'favourites',
        canActivate: [AuthGuard],
        component: FavouritesComponent
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        component: ProfileComponent
      },
      {
        path: 'b-home',
        canActivate: [AuthGuard],
        component: BHomeComponent
      },
      {
        path: 'employees',
        canActivate: [AuthGuard],
        component: EmployeesComponent,
      },
      {
        path: 'b-profile',
        canActivate: [AuthGuard],
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
