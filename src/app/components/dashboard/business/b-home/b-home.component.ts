import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
import { IonReorderGroup } from '@ionic/angular';
import { ItemReorderEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { IBusiness } from 'src/app/core/models/business.interface';
import { ITurn } from 'src/app/core/models/turn.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-b-home',
  templateUrl: './b-home.component.html',
  styleUrls: ['./b-home.component.scss'],
})
export class BHomeComponent implements OnInit {

  @ViewChild('turnsReorder') turnsReorder: IonReorderGroup;

  turnRef: AngularFireObject<ITurn>;
  turn$: Subscription;
  turns: ITurn[] = [];

  businessKey: string;
  isOpened: boolean = false;

  constructor(private authService: AuthService, 
    private repositoryService: RepositoryService<any>,
    private utilityService: UtilityService) { }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    const user = this.authService.userData;
    this.businessKey = user.uid;

    this.getTurns();
    this.getBusinessStatus();
  }

  getTurns(){
    this.turnRef = this.repositoryService.getAllElements(`clientsInTurn/${this.businessKey}`);
    this.turn$ = this.turnRef.snapshotChanges().subscribe(result=>{
      const data = result.payload.val();
      this.turns = [];
      for(let turnKey in data){
        data[turnKey].key = turnKey;
        this.turns.push(data[turnKey]);
      }
    });
  }

  getBusinessStatus(){
    const businessStatus: AngularFireObject<IBusiness> = this.repositoryService.getAllElements(`businessList/${this.businessKey}`);
    const businessStatus$ = businessStatus.valueChanges().subscribe(result=>{
      this.isOpened = result.isOpened;
      businessStatus$.unsubscribe();
    });
  }


  async reorderTurns(ev: CustomEvent<ItemReorderEventDetail>) {
    const sortedTurns = ev.detail.complete(this.turns);
    await this.updateClientTurn(this.turns);
    return sortedTurns;
  }

  async updateClientTurn(turns: ITurn[]){
    await this.utilityService.presentLoading();
    turns.forEach((turn, index)=>{
      this.repositoryService.updateElement(`clientsInTurn/${turn.businessKey}/${turn.clientKey}`,{
        turnNum: index + 1
      }).then(()=>{
        this.utilityService.closeLoading();
      }).catch(()=> this.utilityService.closeLoading());
    });
  }

  toggleReorder(){
    const reorderParent = document.getElementById('reorder-parent');

    if(reorderParent.attributes[2].value === 'true'){
      document.getElementById('toggle-icon').setAttribute('name', 'close-circle-outline');
      reorderParent.setAttribute('disabled', 'false');
      this.utilityService.presentToast('Arrastra los elementos para ordenarlos', 'success-toast');
    }else{
      document.getElementById('toggle-icon').setAttribute('name', 'reorder-three-outline');
      reorderParent.setAttribute('disabled', 'true');
    }
  }

  async openCancelTurn(turn: ITurn){
    await this.utilityService.presentAlertWithActions('Confirmar',
    '¿Estás seguro de querer eliminar este turno?',
    ()=>{ this.cancelTurn(turn.clientKey) },
    ()=>{ this.utilityService.closeAlert() });
  }

  async cancelTurn(clientKey: string){
    await this.repositoryService.updateElement(`users/${clientKey}`, {
      isInTurn: false
    }).then(()=>{
      this.repositoryService.deleteElement(`clientsInTurn/${this.businessKey}/${clientKey}`);
    });
  }

  async updateBusinessStatus(ev){
    await this.repositoryService.updateElement(`businessList/${this.businessKey}`, {
      isOpened: this.isOpened
    });
  }

  ionViewWillLeave() {
    this.turn$.unsubscribe();
  }
}
