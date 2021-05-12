import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) { }

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

  async presentSimpleAlert(title: string, message: string){
    const alert = await this.alertCtrl.create({
      header: title,
      message: message,
      cssClass: 'custom-info-alert',
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar'
      }]
    });
    (await alert).present();
  }
}
