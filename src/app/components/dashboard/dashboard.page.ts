import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  userUid: string;
  isBusiness: boolean;
  constructor(private activatedRoute: ActivatedRoute, 
    private router: Router) { 
  }

  async ngOnInit() {
    this.isBusiness = JSON.parse((await Storage.get({key: 'role'})).value);
  }
}
