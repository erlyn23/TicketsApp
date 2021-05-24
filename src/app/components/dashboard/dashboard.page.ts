import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility.service';

const { Storage } = Plugins;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  userUid: string;
  isBusiness: boolean;
  constructor(private platform: Platform, 
    private utilityService: UtilityService,
    private authService: AuthService) { 
    
    
    this.platform.backButton.subscribeWithPriority(7, async ()=>{
      await this.utilityService.presentAlertWithActions('Alerta', '¿Estás seguro de querer cerrar sesión?', 
      async ()=>{
        await this.authService.signOut();
      }, ()=>{
        this.utilityService.closeAlert();
      });
    });
  }

  async ngOnInit() {
    this.isBusiness = JSON.parse((await Storage.get({key: 'role'})).value);
  }
}
