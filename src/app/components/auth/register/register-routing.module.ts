import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterBusinessComponent } from './register-business/register-business.component';

import { RegisterPage } from './register.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterPage
  },
  {
    path: 'register-business',
    component: RegisterBusinessComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterPageRoutingModule {}
