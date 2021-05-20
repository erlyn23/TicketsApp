import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RevocerPasswordPageRoutingModule } from './revocer-password-routing.module';

import { RevocerPasswordPage } from './revocer-password.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RevocerPasswordPageRoutingModule
  ],
  declarations: [RevocerPasswordPage]
})
export class RevocerPasswordPageModule {}
