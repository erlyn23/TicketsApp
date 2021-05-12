import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { IAuth } from '../models/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router){}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.authService.userData;
    if(user){
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
  
}
