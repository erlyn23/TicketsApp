import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { IonTabs, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility.service';

const { Storage } = Plugins;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  @ViewChild('customerTabs') customerTabs: IonTabs; 
  @ViewChildren('businessTabs') businessTabs: QueryList<IonTabs>;
 
  private businessTabsChild: IonTabs;


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

  ngOnInit() {
    
  }

  async ngAfterViewInit() {
    this.isBusiness = JSON.parse((await Storage.get({key: 'role'})).value);
    if(!this.isBusiness) this.customerTabs.select('home');
    else{
      this.businessTabs.changes.subscribe((tab: QueryList<IonTabs>)=>{
        this.businessTabsChild = tab.first;
        this.businessTabsChild.select('b-home');
      });
    }
  }
}
