import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterBusinessComponent } from 'src/app/components/auth/register/register-business/register-business.component';
import { MapComponent } from 'src/app/components/core/map/map.component';

@NgModule({
  declarations: [MapComponent, RegisterBusinessComponent],
  imports:[
      CommonModule,
      FormsModule,
      ReactiveFormsModule
  ],
  exports: [MapComponent, RegisterBusinessComponent]
})
export class MapModule {}