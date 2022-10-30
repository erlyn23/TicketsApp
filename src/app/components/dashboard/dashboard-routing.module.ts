import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { BHomeComponent } from './business/b-home/b-home.component';
import { BProfileComponent } from './business/b-profile/b-profile.component';
import { EmployeesComponent } from './business/employees/employees.component';
import { LimitsComponent } from './business/limits/limits.component';
import { ServicesComponent } from './business/services/services.component';
import { ExploreComponent } from './customer/explore/explore.component';
import { FavouritesComponent } from './customer/favourites/favourites.component';
import { HomeComponent } from './customer/home/home.component';
import { EditAccountComponent } from './customer/profile/edit-account/edit-account.component';
import { ProfileComponent } from './customer/profile/profile.component';
import { TurnsComponent } from './customer/turns/turns.component';

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
        path: 'turns',
        canActivate: [AuthGuard],
        component: TurnsComponent
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
        path: 'services',
        canActivate: [AuthGuard],
        component: ServicesComponent
      },
      {
        path: 'b-profile',
        canActivate: [AuthGuard],
        component: BProfileComponent
      },
      {
        path: 'limits',
        canActivate: [AuthGuard],
        component: LimitsComponent
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule {}
