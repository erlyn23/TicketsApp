import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IBusiness } from 'src/app/core/models/business.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.scss'],
})
export class FavouritesComponent implements OnInit {

  userUid: string;
  businessList: IBusiness[] = [];
  objectRef: AngularFireObject<IBusiness[]>;

  businessSubscription: Subscription;

  navExtras: NavigationExtras = { state: { business: null } };

  searchBusiness: IBusiness[] = [];
  isSearch: boolean = false;

  constructor(private repositoryService: RepositoryService<IBusiness[]>,
    private angularFireDatabase: AngularFireDatabase,
    private utilityService: UtilityService,
    private authService: AuthService,
    private router: Router) {
  }

  ngOnInit(){

  }

  ionViewWillEnter() {
    this.userUid = this.authService.userData.uid;
    this.getFavouritesList();
  }

  getFavouritesList(){
    this.objectRef = this.repositoryService.getAllElements(`favourites/${this.userUid}`);
    this.businessSubscription = this.objectRef.snapshotChanges().subscribe(result=>{
      const businessKeyList = result.payload.val();
      this.businessList = [];
      for(let businessKey in businessKeyList){
        this.getBusinessList(businessKey);
      }
    });
  }

  businessListSubscription: Subscription;
  getBusinessList(favouriteKey: string){
    const businessRef: AngularFireObject<IBusiness[]> = this.angularFireDatabase.object(`businessList`);
    this.businessListSubscription = businessRef.snapshotChanges().subscribe(result=>{
      const businessList = result.payload.val();
      for(let businessKey in businessList){
        if(businessKey === favouriteKey){
          businessList[businessKey].key = businessKey;
          this.businessList.push(businessList[businessKey]);
        }
      }
    });    
  }

  searchFilter: string = "";
  searchForBusiness(ev, businessList: IBusiness[]){
    if(this.searchFilter.length > 0){
      this.searchBusiness = [];
      for(let business of businessList){
        if(business.businessName.toLowerCase().includes(this.searchFilter.toLowerCase())){
          this.searchBusiness.push(business);
        }
      }
    }else{
      this.searchBusiness = [];
    }
  }

  toggleSearch(){
    if(!this.isSearch) this.isSearch = true;
    else {
      this.isSearch = false;
      this.searchFilter = "";
      this.searchBusiness = [];
    }
  }
  async deleteBusinessFromFavouriteList(business: IBusiness){
    await this.repositoryService.deleteElement(`favourites/${this.userUid}/${business.key}`).then(async ()=>{
      await this.utilityService.presentToast('Negocio eliminado de favoritos', 'success-toast');
    }).catch(async err=>{
      console.log(err);
      await this.utilityService.presentToast('Ha ocurrido un error al eliminar de favoritos', 'error-toast');
    });
  }

  goToBusinessDetails(business: IBusiness){
    this.navExtras.state.business = business;
    this.router.navigate(['/business-details'], this.navExtras);
  }

  ionViewWillLeave() {
    this.businessSubscription.unsubscribe();
    if(this.businessListSubscription !== undefined) this.businessListSubscription.unsubscribe();
  }

}
