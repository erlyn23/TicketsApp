import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BusinessDetailsPage } from './business-details.page';

const routes: Routes = [
  {
    path: '',
    component: BusinessDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessDetailsPageRoutingModule {}
