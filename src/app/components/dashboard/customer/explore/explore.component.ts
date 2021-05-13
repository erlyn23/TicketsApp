import { Component, OnInit } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
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

  navExtras: NavigationExtras = { state: { business: null } };

  constructor(private repositoryService: RepositoryService<IBusiness[]>,
    private router: Router) {
  }

  ngOnInit() {
    this.getBusinessList();
  }

  getBusinessList(){
    this.objectRef = this.repositoryService.getAllElements(`businessList`);
    this.businessSubscription = this.objectRef.snapshotChanges().subscribe(result=>{
      const data = result.payload.val();

      for(let item in data){
        this.businessList.push(data[item]);
      }
    });
  }

  goToBusinessDetails(business: IBusiness){
    this.navExtras.state.business = business;
    this.router.navigate(['/business-details'], this.navExtras);
  }

  ngOnDestroy(): void {
    this.businessSubscription.unsubscribe();
  }

}
