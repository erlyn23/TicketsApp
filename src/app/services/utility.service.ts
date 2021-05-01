import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(private toastCtrl: ToastController,
    private loadingCtrl: LoadingController) { }

  async presentToast(message: string, customClass: string){
    const toast = this.toastCtrl.create({
      message: message,
      cssClass: customClass,
      duration: 3000
    });

    (await toast).present();
  }

  async presentLoading(){
    const loading = this.loadingCtrl.create({
      message: 'Procesando solicitud, por favor espere...',
      backdropDismiss: false,
      cssClass: 'custom-loading'
    });

    (await loading).present();
  }

  closeLoading(){
    this.loadingCtrl.dismiss();
  }
}
