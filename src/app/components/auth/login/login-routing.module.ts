import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterTypesComponent } from '../register-types/register-types.component';

import { LoginPage } from './login.page';

const routes: Routes = [
  {
    path: '',
    component: LoginPage
  },
  {
    path: 'register-types',
    component: RegisterTypesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginPageRoutingModule {}
