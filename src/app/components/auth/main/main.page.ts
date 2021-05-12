import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IAuth } from 'src/app/core/models/auth.interface';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  constructor(private authService: AuthService,private router:Router) {
    const user = this.authService.userData;
    if(user){
      this.router.navigate(['/dashboard'])
    }
  }

  ngOnInit() {
  }

  goToPage(page: string){
    this.router.navigate([`/${page}`]);
  }

}
