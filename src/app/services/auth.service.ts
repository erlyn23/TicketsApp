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
import { RepositoryService } from './repository.service';

const { Storage } = Plugins;

const LOGIN_ROUTE = '/login';
const DASHBOARD_ROUTE = '/dashboard';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubject: BehaviorSubject<firebase.default.User> = null;
  user$: Observable<firebase.default.User>;
  
  constructor(private angularFireAuth: AngularFireAuth, 
  private angularFireDatabase: AngularFireDatabase,
  private utilityService: UtilityService,
  private repositoryService: RepositoryService,
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
    await this.angularFireAuth.signInWithEmailAndPassword(auth.email, auth.password).then(async result=>{
        if(result){
          if(result.user.emailVerified){
            await this.angularFireAuth.currentUser.then(async result=>{
              if(result) {
                await Storage.set({key: 'user', value: JSON.stringify(result)});
                this.userSubject.next(result);
                this.router.navigate([DASHBOARD_ROUTE])
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
  }

  async getUserRole(uid: string){
    const isBusiness: AngularFireObject<boolean> = await this.angularFireDatabase.object(`users/${uid}/isBusiness`);
    if(isBusiness) return true;
    return false;
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
            this.router.navigate([DASHBOARD_ROUTE])
          };
        
        });
      }
    });
  }

  async saveUserInDatabase(user:IUser, result){

    const infoMessage = 'Gracias por registrarte con nosotros, para iniciar sesión, primero debes verificar tu cuenta de correo electrónico';
    const infoTitle = 'Información';

    if(user.isBusiness){
      const userWithBusiness = {
        fullName: user.fullName,
        email: user.email,
        isBusiness: user.isBusiness,
        latitude: user.latitude,
        long: user.long,
        businessName: user.businessName
      }
      await this.repositoryService.setElement(`users/${result.user.uid}`, userWithBusiness).then(async ()=>{
        await this.utilityService.presentSimpleAlert(infoTitle, infoMessage);
        this.router.navigate([LOGIN_ROUTE]);
      });
    }else{
      const userWithoutBusiness = {
        fullName: user.fullName,
        email: user.email,
        isBusiness: user.isBusiness,
      };
      await this.repositoryService.setElement(`users/${result.user.uid}`, userWithoutBusiness).then(async ()=>{
        await this.utilityService.presentSimpleAlert(infoTitle, infoMessage);
        this.router.navigate([LOGIN_ROUTE]);
      });
    }
  }

  async signOut(){
    await this.angularFireAuth.signOut().then(async ()=>{
      await Storage.remove({key: 'user'});
      this.userSubject.next(null);
      this.router.navigate([LOGIN_ROUTE]);
    });
  }
}
