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

  private userSubject: BehaviorSubject<IAuth> = new BehaviorSubject<IAuth>(null);
  user: Observable<IAuth>;

  constructor(private angularFireAuth: AngularFireAuth, 
  private angularFireDatabase: AngularFireDatabase,
  private utilityService: UtilityService,
  private router: Router) {
    this.setUserData();
  }

  async setUserData(){
    const user = await Storage.get({key: 'user'});
    this.userSubject = new BehaviorSubject<IAuth>(JSON.parse(user.value));
    this.user = this.userSubject.asObservable();
  }

  public get userData():IAuth{
    const storedUser: IAuth = this.userSubject.value;
    if(storedUser != undefined){
      return this.userSubject.value;
    }
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
      }
    }).catch(error=>{
      switch(error.code){
        case 'auth/wrong-password':
          this.utilityService.presentToast('Correo o contraseña incorrecta', 'error-toast');
        break;
        case 'auth/too-many-requests':
          this.utilityService.presentToast('Has intentado iniciar sesión demasiadas veces, inténtalo más tarde', 'error-toast');
        break;
        case 'auth/user-not-found':
          this.utilityService.presentToast('Correo o contraseña incorrecta', 'error-toast');
        break;
      }
    });
  }

  async setUserRole(isBusiness:boolean, uid: string){
    await this.angularFireDatabase.object(`users/${uid}`).update({
      isBusiness: isBusiness
    });
  }

  async signOut(){
    await this.angularFireAuth.signOut().then(async ()=>{
      this.router.navigate(['/login']);
      this.userSubject.next(null);
      await Storage.remove({key: 'user'});
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
          isBusiness: false,
          step: 1
        }).then(()=>{
          this.router.navigate(['/login']);
        });
      }
    });
  }
}
