import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import * as firebase from 'firebase/app';
import { IAuth } from '../core/models/auth.interface';
import { IUser } from '../core/models/user.interface';
import { Router } from '@angular/router';
import { UtilityService } from './utility.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubject: BehaviorSubject<firebase.default.User> = null;
  user$: Observable<firebase.default.User>;
  
  constructor(private angularFireAuth: AngularFireAuth, 
  private angularFireDatabase: AngularFireDatabase,
  private utilityService: UtilityService,
  private router: Router) {
    Storage.get({key: 'user'}).then(result=>{
      this.userSubject = new BehaviorSubject<firebase.default.User>(JSON.parse(result.value));
      this.user$ = this.userSubject.asObservable();
    });
  }

  public get userData(){
    if(this.userSubject != null){ 
      const user = this.userSubject.value;
      return user;
    };
  }

  async signIn(auth: IAuth){
    await firebase.default.auth().setPersistence(firebase.default.auth.Auth.Persistence.LOCAL).then(async ()=>{
      return await this.angularFireAuth.signInWithEmailAndPassword(auth.email, auth.password).then(async result=>{
        if(result){
          if(result.user.emailVerified){
            await this.angularFireAuth.currentUser.then(async result=>{
              if(result) {
                await Storage.set({key: 'user', value: JSON.stringify(result)});
                this.userSubject.next(result);
                this.router.navigate(['/dashboard'])
              }
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
    });
  }

  async getUserRole(uid: string){
    const isBusiness: AngularFireObject<boolean> = await this.angularFireDatabase.object(`users/${uid}/isBusiness`);
    if(isBusiness){

    }
  }

  async registerUser(user: IUser){
    await this.angularFireAuth.createUserWithEmailAndPassword(user.email, user.password).then(async result=>{
      if(result){
        await result.user.sendEmailVerification();
        await this.saveUserInDatabase(user, result);
      }
    });
  }

  async facebookLogin(){
    await this.withExternalPopUp(new firebase.default.auth.FacebookAuthProvider());
  }
  async googleLogin(){
    await this.withExternalPopUp(new firebase.default.auth.GoogleAuthProvider());
  }

  async withExternalPopUp(provider){
    await this.angularFireAuth.signInWithPopup(provider).then(async result=>{
      if(result.additionalUserInfo.isNewUser){
        const profile = result.user;
        const user: IUser = {
          email: profile.email,
          fullName: profile.displayName,
          password: '',
          isBusiness: false
        };
        await result.user.sendEmailVerification();
        await this.saveUserInDatabase(user, result);
      }else if(!result.user.emailVerified){
        this.utilityService.presentToast('No has verificado tu correo electrónico', 'error-toast')
      }else{
        await this.angularFireAuth.currentUser.then(async result=>{
          if(result){
            await Storage.set({key: 'user', value: JSON.stringify(result)});
            this.userSubject.next(result);
            this.router.navigate(['/dashboard'])
          };
        });
      }
    });
  }

  async saveUserInDatabase(user:IUser, result){
    if(user.isBusiness){
      const userWithBusiness = {
        fullName: user.fullName,
        email: user.email,
        isBusiness: user.isBusiness,
        address: user.address,
        businessName: user.businessName
      }
      this.setUser(userWithBusiness, result);
    }else{
      const userWithoutBusiness = {
        fullName: user.fullName,
        email: user.email,
        isBusiness: user.isBusiness,
      };
      this.setUser(userWithoutBusiness, result);
    }
  }

  async setUser(user, result){
    await this.angularFireDatabase.object(`users/${result.user.uid}`).set(user).then(async ()=>{
      await this.utilityService.presentSimpleAlert('Información', 
      'Gracias por registrarte con nosotros, para iniciar sesión, primero debes verificar tu cuenta de correo electrónico');
      this.router.navigate(['/login']);
    });
  }
  async signOut(){
    await this.angularFireAuth.signOut().then(async ()=>{
      await Storage.remove({key: 'user'});
      this.userSubject.next(null);
      this.router.navigate(['/login']);
    });
  }
}
