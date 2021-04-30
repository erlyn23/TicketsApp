import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(private toastCtrl: ToastController) { }

  async presentToast(message: string, customClass: string){
    const toast = this.toastCtrl.create({
      message: message,
      cssClass: customClass,
      duration: 3000
    });

    (await toast).present();
  }
}
