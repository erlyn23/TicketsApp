import { Injectable } from '@angular/core';
import { AlertController, 
  LoadingController, 
  ToastController,
  ModalController,
  PopoverController
} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController) { }

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

  async presentAlertWithActions(title: string, message: string,
    confirmHandler: (value: any)=> boolean | void | { [key: string]: any}, 
    cancelHandler: (value: any)=> boolean | void | { [key: string]: any}){
    const alert = await this.alertCtrl.create({
      header: title,
      message: message,
      cssClass: 'custom-info-alert',
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar',
        handler: confirmHandler
      },{
        text: 'Cancelar',
        handler: cancelHandler
      }]
    });

    (await alert).present();
  }

  closeAlert(){
    this.alertCtrl.dismiss();
  }

  async openModal(component, data?, additionalKey?:string){
    const modal = this.modalCtrl.create({
      component: component,
      cssClass: 'custom-modal',
      componentProps:{
        'data': data,
        'additionalKey': additionalKey
      },
      swipeToClose: true
    });
    (await modal).present();
  }

  closeModal(){
    this.modalCtrl.dismiss();
  }

  async showPopover(component){
    const popover = this.popoverCtrl.create({
      component: component,
      cssClass: 'custom-popover',
      translucent: true,
      mode: 'ios',
      animated: true
    });

    (await popover).present();
  }

  closePopover(){
    this.popoverCtrl.dismiss();
  }
}
