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

  navExtras: NavigationExtras = { state: { business: null, clientsInTurn: 0 } };

  clientsInTurnCount: number = 0;

  searchBusiness: IBusiness[] = [];

  constructor(private repositoryService: RepositoryService<IBusiness[]>,
    private angularFireDatabase: AngularFireDatabase,
    private utilityService: UtilityService,
    private authService: AuthService,
    private router: Router) {
  }

  ngOnInit() {
    this.userUid = this.authService.userData.uid;
    this.getFavouritesList();
  }

  getFavouritesList(){
    this.objectRef = this.repositoryService.getAllElements(`favourites/${this.userUid}`);
    this.businessSubscription = this.objectRef.snapshotChanges().subscribe(result=>{
      const businessKeyList = result.payload.val();
      this.businessList = [];
      this.clientsInTurnCount = 0;
      for(let businessKey in businessKeyList){
        this.getBusinessList(businessKey);
      }
    });
  }

  getBusinessList(businessKey: string){
    const businessRef: AngularFireObject<IBusiness> = this.angularFireDatabase.object(`businessList/${businessKey}`);
    const business$ = businessRef.valueChanges().subscribe(result=>{
      result.key = businessKey;
      this.businessList.push(result);
      //Ciclo para obtener la cuenta general de los clientes en turno
      for(let employeeKey in result.employees){
        let turnCount = result.employees[employeeKey].clientsInTurn;
        this.clientsInTurnCount += turnCount;
      }
      business$.unsubscribe();
    });    
  }

  searchFilter: string = "";
  searchForBusiness(ev, businessList: IBusiness[]){
    let searchFilter:string = ev.target.value;
    if(searchFilter.length > 0){
      for(let business of businessList){
        this.searchBusiness = [];
        if(business.businessName.toLowerCase().includes(searchFilter.toLowerCase())){
          this.searchBusiness.push(business);
        }
      }
    }
    else{
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

  goToBusinessDetails(business: IBusiness, clientsInTurnCount: number){    
    this.navExtras.state.business = business;
    this.navExtras.state.clientsInTurn = clientsInTurnCount;
    this.router.navigate(['/business-details'], this.navExtras);
  }

  ngOnDestroy(): void {
    this.businessSubscription.unsubscribe();
  }

}
