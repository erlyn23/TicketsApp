import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  constructor(private menuCtrl: MenuController) { }

  ngOnInit() {
  }

  openMenu(){
    this.menuCtrl.enable(true, 'first');
    this.menuCtrl.toggle();
  }

}
