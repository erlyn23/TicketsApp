import { Injectable, NgZone } from '@angular/core';
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
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';

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
  private repositoryService: RepositoryService<IUser>,
  private ngZone: NgZone,
  private facebook: Facebook,
  private googlePlus: GooglePlus,
  private platform: Platform,
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

  async registerUser(user: IUser){
    await this.angularFireAuth.createUserWithEmailAndPassword(user.email, user.password).then(async result=>{
      if(result){
        await result.user.sendEmailVerification();
        await result.user.updateProfile({displayName: user.fullName});
        await this.saveUserInDatabase(user, result);
      }
    });
  }

  async signIn(auth: IAuth){
    await this.angularFireAuth.signInWithEmailAndPassword(auth.email, auth.password).then(async result=>{
        if(result){
          if(result.user.emailVerified){
            await this.angularFireAuth.currentUser.then(async result=>{
              if(result) {
                await Storage.set({key: 'user', value: JSON.stringify(result)});
                this.saveUserRole(result.uid);
                this.userSubject.next(result);
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

  async facebookLogin(){
    if(this.platform.is('android')){
      await this.utilityService.presentLoading();
      const res: FacebookLoginResponse = await this.facebook.login(['public_profile', 'email']);
      const facebookCrendential = firebase.default.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
      await this.signInWithFacebook(facebookCrendential);
    }else{
      this.socialSignIn(new firebase.default.auth.FacebookAuthProvider());
    }
  }

  async signInWithFacebook(credential){
    await this.angularFireAuth.signInWithCredential(credential).then(result=>{
      this.socialSignInLogic(result);
      this.utilityService.closeLoading();
    });
  }
  
  async googleLogin(){

    if(this.platform.is('android')){
      await this.utilityService.presentLoading();
      await this.googlePlus.login({
        'webClientId': environment.clientId,
        'offline': true
      }).then(async res=>{
        await this.signInWithGoogle(res);
      }).catch(err=>{
        this.utilityService.closeLoading();
      });
    }else{
      const provider = new firebase.default.auth.GoogleAuthProvider();
      await this.socialSignIn(provider);
    }
  } 

  async signInWithGoogle(loginResponse){
    const credential = firebase.default.auth.GoogleAuthProvider.credential(loginResponse.idToken)
    await this.angularFireAuth.signInWithCredential(credential).then(async result=>{
      await this.socialSignInLogic(result);
      this.utilityService.closeLoading();
    }).catch(async err=>{
      this.utilityService.closeLoading();
    });
  }

  async socialSignIn(provider){
    await this.angularFireAuth.signInWithPopup(provider).then(async result=>{
      await this.socialSignInLogic(result);
    });
  }

  async socialSignInLogic(result){
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
          this.saveUserRole(result.uid);
          this.userSubject.next(result);
        };
      
      });
    }
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

      const businessInfo = {
        businessName: user.businessName,
        latitude: user.latitude,
        long: user.long,
        clientsInTurn: 0,
        businessPhoto: "",
      }
      await this.repositoryService.setElement(`users/${result.user.uid}`, userWithBusiness).then(async ()=>{
        await this.repositoryService.setElement(`businessList/${result.user.uid}`, businessInfo);
        await this.utilityService.presentSimpleAlert(infoTitle, infoMessage);
        this.router.navigate([LOGIN_ROUTE]);
      });
    }else{
      
      const userId: number = Math.floor(Math.random() * (15000 - 1000)) + 1000;
      
      const userWithoutBusiness = {
        userId: userId,
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

  saveUserRole(uid: string){
    const fireObject: AngularFireObject<IUser> = this.angularFireDatabase.object(`users/${uid}`);
    fireObject.valueChanges().subscribe(result=>{
      Storage.set({key: 'role', value: JSON.stringify(result.isBusiness)}).then(()=>{
        this.ngZone.run(()=>{
          this.router.navigate([DASHBOARD_ROUTE]);
        });
      });
    });
  }

  async signOut(){
    await this.angularFireAuth.signOut().then(async ()=>{
      await Storage.remove({key: 'user'});
      await Storage.remove({key: 'role'});
      this.userSubject.next(null);
      this.router.navigate([LOGIN_ROUTE]);
    });
  }
}
