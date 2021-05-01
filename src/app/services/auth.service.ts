import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject, Observable } from 'rxjs';
import { IAuth } from '../core/models/auth.interface';
import { IUser } from '../core/models/user.interface';

import { Plugins } from '@capacitor/core';
import { Router } from '@angular/router';
import { UtilityService } from './utility.service';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubject: BehaviorSubject<IAuth>;
  user: Observable<IAuth>;


  public get userData():IAuth{
    return this.userSubject.value;
  }
  constructor(private angularFireAuth: AngularFireAuth, 
  private angularFireDatabase: AngularFireDatabase,
  private utilityService: UtilityService,
  private router: Router) {
    
    Storage.get({key: 'user'}).then(result=>{
      this.userSubject = new BehaviorSubject<IAuth>(JSON.parse(result.value));
      this.user = this.userSubject.asObservable();
    });
  
  }

    async signIn(auth: IAuth){
      await this.angularFireAuth.signInWithEmailAndPassword(auth.email, auth.password).then(async result=>{
        if(result){
          if(result.user.emailVerified){
            await this.angularFireAuth.currentUser.then(async result=>{
              const user: IAuth = {email: result.email, password: auth.password};
              await Storage.set({key: 'user', value: JSON.stringify(user)})
              this.userSubject.next(user);
              this.router.navigate(['/dashboard']);
            });
          }else{
            await this.utilityService.presentToast('No has verificado tu correo electrónico', 'error-toast');
          }
        }else{
          await this.utilityService.presentToast('Correo o contraseña incorrecta', 'error-toast');
        }
      });
    }

    async registerUser(user: IUser){
      await this.angularFireAuth.createUserWithEmailAndPassword(user.email, user.password).then(async result=>{
        if(result){
          await result.user.sendEmailVerification();
          await this.angularFireDatabase.object(`users/${result.user.uid}`).set({
            fullName: user.fullName,
            phone: user.phone,
            email: user.email,
            isBusiness: false
          }).then(()=>{
            this.router.navigate(['/login']);
          });
        }
      });
    }
}
