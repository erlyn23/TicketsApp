import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Plugins } from '@capacitor/core';
import { NavController } from '@ionic/angular';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, 
    private router: Router,
    private navCtrl: NavController){}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    
    const user = this.authService.userData;
    
    if(!user){
      this.navCtrl.pop().then(()=>{
        this.router.navigate(['/login']);
      });
      return false;
    }
    
    return true;
  }
  
}
