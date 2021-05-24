import { Component, OnInit } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IBusiness } from 'src/app/core/models/business.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
})
export class ExploreComponent implements OnInit {

  userUid: string;
  businessList: IBusiness[] = [];
  objectRef: AngularFireObject<IBusiness[]>;

  businessSubscription: Subscription;

  navExtras: NavigationExtras = { state: { business: null, clientsInTurn: 0 } };

  clientsInTurnCount: number = 0;

  searchBusiness: IBusiness[] = [];

  constructor(private repositoryService: RepositoryService<IBusiness[]>,
    private utilityService: UtilityService,
    private authService: AuthService,
    private router: Router) {
  }

  ngOnInit() {
    this.userUid = this.authService.userData.uid;
    this.getBusinessList();
  }

  getBusinessList(){
    this.objectRef = this.repositoryService.getAllElements(`businessList`);
    this.businessSubscription = this.objectRef.snapshotChanges().subscribe(result=>{
      const businessList = result.payload.val();
      this.businessList = [];
      for(let businessKey in businessList){
        businessList[businessKey].key = businessKey;
        this.businessList.push(businessList[businessKey]);
        
        for(let employeeKey in businessList[businessKey].employees){
          this.clientsInTurnCount = 0;
          let turnsCount = businessList[businessKey].employees[employeeKey].clientsInTurn;
          this.clientsInTurnCount += turnsCount;
          this.updateClientsInTurn(businessKey, this.clientsInTurnCount);
        }
      }
    });
  }

  updateClientsInTurn(businessKey: string, clientsInTurn: number){
    this.repositoryService.updateElement(`businessList/${businessKey}`,{
      clientsInTurn: clientsInTurn,
    });
  }

  searchFilter: string = "";
  searchForBusiness(ev, businessList: IBusiness[]){
    let searchFilter:string = ev.target.value;
    if(searchFilter.length > 0){
      
      this.searchBusiness = [];
      for(let business of businessList){
        if(business.businessName.toLowerCase().includes(searchFilter.toLowerCase())){
          this.searchBusiness.push(business);
        }
      }
    }
    else{
      this.searchBusiness = [];
    }
  }

  async addBusinessToFavouriteList(business: IBusiness){
    await this.repositoryService.setElement(`favourites/${this.userUid}/${business.key}`, {businessKey: business.key}).then(async ()=>{
      await this.utilityService.presentToast('Negocio añadido a favoritos', 'success-toast');
    }).catch(async err=>{
      console.log(err);
      await this.utilityService.presentToast('Ha ocurrido un error al añadir a favoritos', 'error-toast');
    });
  }

  goToBusinessDetails(business: IBusiness, clientsInTurnCount: number){
    this.navExtras.state.business = business;
    this.navExtras.state.clientsInTurn = clientsInTurnCount;
    this.router.navigate(['/business-details'], this.navExtras);
  }

  ngOnDestroy(): void {
    this.businessSubscription.unsubscribe();
  }

}
