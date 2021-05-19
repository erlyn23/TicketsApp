import { Component, OnInit } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IBusiness } from 'src/app/core/models/business.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
})
export class ExploreComponent implements OnInit {

  userUuid: string;
  businessList: IBusiness[] = [];
  objectRef: AngularFireObject<IBusiness[]>;

  businessSubscription: Subscription;

  navExtras: NavigationExtras = { state: { business: null, clientsInTurn: 0 } };

  clientsInTurnCount: number = 0;

  constructor(private repositoryService: RepositoryService<IBusiness[]>,
    private router: Router) {
  }

  ngOnInit() {
    this.getBusinessList();
  }

  getBusinessList(){
    this.objectRef = this.repositoryService.getAllElements(`businessList`);
    this.businessSubscription = this.objectRef.snapshotChanges().subscribe(result=>{
      const businessList = result.payload.val();

      this.businessList = [];
      this.clientsInTurnCount = 0;
      for(let businessKey in businessList){
        businessList[businessKey].key = businessKey;
        this.businessList.push(businessList[businessKey]);
        
        //Ciclo para obtener la cuenta general de los clientes en turno
        for(let employeeKey in businessList[businessKey].employees){
          let turnCount = businessList[businessKey].employees[employeeKey].clientsInTurn;
          this.clientsInTurnCount += turnCount;
        }
      }
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
