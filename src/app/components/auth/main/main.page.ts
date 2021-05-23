import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { IAuth } from 'src/app/core/models/auth.interface';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  constructor(private authService: AuthService,
    private router:Router, 
    private navCtrl: NavController) {
    
    const user = this.authService.userData;
    if(user){
      console.log(user);
      this.navCtrl.pop().then(()=>{
        this.router.navigate(['/dashboard']);
      });
    }
  }

  ngOnInit() {
  }

  goToPage(page: string){
    this.router.navigate([`/${page}`]);
  }

}
