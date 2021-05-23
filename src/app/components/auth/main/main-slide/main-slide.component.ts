import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { IonSlide, IonSlides, NavController } from '@ionic/angular';

@Component({
  selector: 'app-main-slide',
  templateUrl: './main-slide.component.html',
  styleUrls: ['./main-slide.component.scss'],
})
export class MainSlideComponent implements OnInit {

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    autoplay: true,
    loop: true
  };
  @ViewChild('slideCtrl') slideCtrl: IonSlides;
  constructor(private authService: AuthService, 
    private router: Router,
    private navCtrl: NavController) { }

  ngOnInit() {
  }

  checkCredentials(){
    this.navCtrl.pop().then(()=>{
      const user = this.authService.userData;
      if(user) this.router.navigate(['/dashboard']);
      else this.router.navigate(['/login']);
    });
  }
}
