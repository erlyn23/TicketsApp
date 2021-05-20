import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-revocer-password',
  templateUrl: './revocer-password.page.html',
  styleUrls: ['./revocer-password.page.scss'],
})
export class RevocerPasswordPage implements OnInit {

  email: string = "";
  constructor(private utilityService: UtilityService, 
    private angularFireAuth: AngularFireAuth) { }

  ngOnInit() {
  }

  async sendEmailToChangePassword(){
    if(this.email.length !== 0){
      await this.utilityService.presentLoading();
      await this.angularFireAuth.sendPasswordResetEmail(this.email).then(async ()=>{
        await this.utilityService.presentSimpleAlert('Información', 
        'Por favor, verifica tu correo electrónico para cambiar tu contraseña');
        this.utilityService.closeLoading();
      }).catch(async err=>{
        console.log(err);
        await this.utilityService.presentToast('Error al enviar solicitud', 'error-toast');
        this.utilityService.closeLoading();
      });
    }else{
      await this.utilityService.presentToast('Debes escribir un correo', 'error-toast');
    }
  }

}
