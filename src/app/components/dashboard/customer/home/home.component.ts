import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IBusiness } from 'src/app/core/models/business.interface';
import { IUser } from 'src/app/core/models/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  userPhoto: string = "";
  userName: string = "";

  userUid: string = "";

  navExtras: NavigationExtras = { state: { business: null, clientsInTurn: 0 } };

  constructor(private authService: AuthService, 
    private repositoryService: RepositoryService<IUser>,
    private businessRepoService: RepositoryService<IBusiness[]>,
    private angularFireDatabase: AngularFireDatabase,
    private utilityService: UtilityService,
    private router: Router) { }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    this.userUid = this.authService.userData.uid;

    this.getUserData();
    this.getTopThree();
  }

  user$: Subscription;
  getUserData(){
    const angularFireObject: AngularFireObject<IUser> = this.repositoryService.getAllElements(`users/${this.userUid}`);
    this.user$ = angularFireObject.valueChanges().subscribe(result=>{
      this.userPhoto = result.photo;
      this.userName = result.fullName;
    });
  }
  businessTopThreeList: IBusiness[] = [];
  businessObject: AngularFireObject<IBusiness[]>;
  business$: Subscription;
  getTopThree(){
    this.businessObject = this.businessRepoService.getAllElements(`businessList`);
    this.business$ = this.businessObject.snapshotChanges().subscribe(result=>{
      const businessList = result.payload.val();
      this.businessTopThreeList = [];
      if(businessList.length > 3){
        let sortable = [];
        for(let businessKey in businessList){
          businessList[businessKey].key = businessKey;
          sortable.push([businessKey, businessList[businessKey].clientsInTurn]);
        }
        sortable.sort((a, b)=>{
          return b[1] - a[1];
        });

        for(let businessKey in businessList){
          if(sortable[0][0] === businessKey) this.businessTopThreeList[0] = businessList[businessKey];
          if(sortable[1][0] === businessKey) this.businessTopThreeList[1] = businessList[businessKey];
          if(sortable[2][0] === businessKey) this.businessTopThreeList[2] = businessList[businessKey];
        }
      }else{

        for(let businessKey in businessList){
          businessList[businessKey].key = businessKey;
          this.businessTopThreeList.push(businessList[businessKey]);
        }
      }
    });
  }

  searchFromExistingFavourite(businessKey: string){
    const favourite: AngularFireObject<any> = this.angularFireDatabase.object(`favourites/${this.userUid}/${businessKey}`);
    const favouriteBusiness$ = favourite.valueChanges().subscribe(async result=>{
      if(result){
        await this.utilityService.presentToast('Este negocio ya está en tus favoritos', 'error-toast');
        favouriteBusiness$.unsubscribe();
      }else{
        this.addBusinessToFavouriteList(businessKey);
        favouriteBusiness$.unsubscribe();
      }
    });
  }

  addBusinessToFavouriteList(businessKey: string){
    this.repositoryService.setElement(`favourites/${this.userUid}/${businessKey}`, {businessKey: businessKey}).then(async ()=>{
      await this.utilityService.presentToast('Negocio añadido a favoritos', 'success-toast');
    }).catch(async err=>{
      console.log(err);
      await this.utilityService.presentToast('Ha ocurrido un error al añadir a favoritos', 'error-toast');
    });
  }

  goToBusinessDetails(business: IBusiness){
    this.navExtras.state.business = business;
    this.navExtras.state.clientsInTurn = business.clientsInTurn;
    this.router.navigate(['/business-details'], this.navExtras);
  }

  ngOnDestroy() {
  }
  
  ionViewWillLeave() {
    this.user$.unsubscribe();
    this.business$.unsubscribe();
  }

}
