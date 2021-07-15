import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { FavouritesComponent } from './components/dashboard/customer/favourites/favourites.component';
import { HomeComponent } from './components/dashboard/customer/home/home.component';
import { EditAccountComponent } from './components/dashboard/customer/profile/edit-account/edit-account.component';
import { HelpComponent } from './components/dashboard/customer/profile/help/help.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./components/auth/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./components/auth/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'main',
    loadChildren: () => import('./components/auth/main/main.module').then( m => m.MainPageModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./components/dashboard/dashboard.module').then( m => m.DashboardPageModule),
  },
  {
    path: 'business-details',
    loadChildren: () => import('./components/dashboard/customer/explore/business-details/business-details.module').then( m => m.BusinessDetailsPageModule)
  },
  {
    path: 'revocer-password',
    loadChildren: () => import('./components/auth/revocer-password/revocer-password.module').then( m => m.RevocerPasswordPageModule)
  },
  {
    path: 'edit-account',
    canActivate: [AuthGuard],
    component: EditAccountComponent
  },
  {
    path: 'favourites',
    canActivate: [AuthGuard],
    component: FavouritesComponent
  },
  {
    path: 'help',
    canActivate: [AuthGuard],
    component: HelpComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
