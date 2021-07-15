import { Component, OnInit } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
import { ItemReorderEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { IBusiness } from 'src/app/core/models/business.interface';
import { IEmployee } from 'src/app/core/models/employee.interface';
import { ITurn } from 'src/app/core/models/turn.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UpdateTurnService } from 'src/app/services/update-turn.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-b-home',
  templateUrl: './b-home.component.html',
  styleUrls: ['./b-home.component.scss'],
})
export class BHomeComponent implements OnInit {
  turnRef: AngularFireObject<ITurn>;
  turn$: Subscription;
  turns: ITurn[] = [];

  businessKey: string;

  business: IBusiness = {
    businessName: '',
    businessPhoto: '',
    isOpened: false,
    openTime: '',
    closeTime: '',
    clientsInTurn: 0,
    employees: [],
    long: 0,
    latitude: 0,
  };
  constructor(private authService: AuthService, 
    private repositoryService: RepositoryService<any>,
    private updateTurnService: UpdateTurnService,
    private utilityService: UtilityService) { }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    const user = this.authService.userData;
    this.businessKey = user.uid;

    this.getTurns();
    this.getBusiness();
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

  getBusiness(){
    const businessStatus: AngularFireObject<IBusiness> = this.repositoryService.getAllElements(`businessList/${this.businessKey}`);
    const businessStatus$ = businessStatus.valueChanges().subscribe(result=>{
      this.business = result;
      businessStatus$.unsubscribe();
    });
  }

  async toggleReorder(){
    const reorderParent = document.getElementById('reorder-parent');

    if(reorderParent.attributes[2].value === 'true'){
      document.getElementById('toggle-icon').setAttribute('name', 'close-circle-outline');
      reorderParent.setAttribute('disabled', 'false');
      await this.utilityService.presentToast('Arrastra los elementos para ordenarlos', 'success-toast');
    }else{
      document.getElementById('toggle-icon').setAttribute('name', 'reorder-three-outline');
      reorderParent.setAttribute('disabled', 'true');
    }
  }

  async openCancelTurn(turn: ITurn){
    await this.utilityService.presentAlertWithActions('Confirmar',
    '¿Estás seguro de querer eliminar este turno?',
    ()=>{ this.getBusinessPreviousQuantity(turn) },
    ()=>{ this.utilityService.closeAlert() });
  }

  getBusinessPreviousQuantity(turn: ITurn){
    const businessObject: AngularFireObject<IBusiness> = this.repositoryService.getAllElements(`businessList/${this.businessKey}`);
    const business$ = businessObject.valueChanges().subscribe(result=>{
      if(result != null){
        this.getEmployeePreviousQuantity(turn, result.clientsInTurn);
        business$.unsubscribe();
      }
    });
  }

  getEmployeePreviousQuantity(turn: ITurn, businessPreviousQuantity: number){
    const object: AngularFireObject<IEmployee> = this.repositoryService.getAllElements(`businessList/${this.businessKey}/employees/${turn.employeeKey}`);
    const employee$ = object.valueChanges().subscribe(async result=>{
      if(result != null){
        await this.cancelTurn(turn, businessPreviousQuantity, result.clientsInTurn);
        employee$.unsubscribe();
      }
    });
  }

  async cancelTurn(turn: ITurn, businessPreviousQuantity: number, employeePreviousQuantity: number){
    this.repositoryService.deleteElement(`users/${turn.clientKey}/turnKeys/${this.businessKey}`).then(()=>{
      this.repositoryService.updateElement(`businessList/${this.businessKey}`,{
        clientsInTurn: businessPreviousQuantity - 1
      }).then(()=>{
        this.repositoryService.updateElement(`businessList/${this.businessKey}/employees/${turn.employeeKey}`,{
          clientsInTurn: employeePreviousQuantity - 1
        }).then(async ()=>{
          await this.repositoryService.deleteElement(`clientsInTurn/${this.businessKey}/${turn.key}`);
          this.updateClientTurn();
          this.utilityService.closeLoading();
        });
      });
    });
  }

  reorderTurns(ev: CustomEvent<ItemReorderEventDetail>) {
    this.turns = ev.detail.complete(this.turns);
    
    this.updateClientTurn();
  }

  updateClientTurn(){
    const tempTurns = this.turns;
    this.updateTurnService.updateTurn(tempTurns, this.businessKey);
  }

  async updateBusinessStatus(ev){
    await this.repositoryService.updateElement(`businessList/${this.businessKey}`, {
      isOpened: this.business.isOpened
    });
  }

  ionViewWillLeave() {
    this.turn$.unsubscribe();
  }
}
