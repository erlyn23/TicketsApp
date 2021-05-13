import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
      {path: '', component: HomeComponent, pathMatch:'full'},
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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule {}
