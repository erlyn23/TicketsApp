import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { ItemReorderEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { IBusiness } from 'src/app/core/models/business.interface';
import { IEmployee } from 'src/app/core/models/employee.interface';
import { INotificationBody } from 'src/app/core/models/notification-body.interface';
import { ITurn } from 'src/app/core/models/turn.interface';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UpdateTurnService } from 'src/app/services/update-turn.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-b-home',
  templateUrl: './b-home.component.html',
  styleUrls: ['./b-home.component.scss'],
})
export class BHomeComponent implements OnInit, OnDestroy {
  turnRef: AngularFireObject<ITurn>;
  turn$: Subscription;
  notification$: Subscription;
  turns: {} = {};
  dateKeys: string[] = [];
  turnLimit: number;

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
    latitude: 0
  };
  profilePhoto: string;
  constructor(private authService: AuthService, 
    private repositoryService: RepositoryService<any>,
    private updateTurnService: UpdateTurnService,
    private utilityService: UtilityService,
    private notificationService: NotificationService) { }

  ngOnInit() {
    const user = this.authService.userData;
    this.businessKey = user.uid;

    this.getTurns();
    this.getBusiness();
    this.notificationService.requestNotification(this.businessKey);
  }


  getTurns(){
    this.turnRef = this.repositoryService.getAllElements(`clientsInTurn/${this.businessKey}`);
    this.turn$ = this.turnRef.snapshotChanges().subscribe(result=>{
      const data = result.payload.val();

      this.dateKeys = [];
      for(let dateKey in data){
        this.dateKeys.push(dateKey);
        this.turns[dateKey] = []; 
        for(let turnKey in data[dateKey]){
          data[dateKey][turnKey].key = turnKey;
          this.turns[dateKey].push(data[dateKey][turnKey]);
        }
      }
    });
  }

  getBusiness(){
    const businessStatus: AngularFireObject<IBusiness> = this.repositoryService.getAllElements(`businessList/${this.businessKey}`);
    const businessStatus$ = businessStatus.valueChanges().subscribe(result=>{
      this.business = result;
      this.profilePhoto = result.businessPhoto;
      this.turnLimit = (result.turnDiaryLimit) ? result.turnDiaryLimit : undefined;
      businessStatus$.unsubscribe();
    });
  }

  async toggleReorder(index:number){
    const reorderParent = document.getElementById(`reorder-parent-${index}`);

    const disabledAttributeIndex = Array.from(reorderParent.attributes).findIndex(a => a.name === 'disabled');
    if(reorderParent.attributes[disabledAttributeIndex].value === 'true'){
      document.getElementById(`toggle-icon-${index}`).setAttribute('name', 'close-circle-outline');
      reorderParent.setAttribute('disabled', 'false');
      await this.utilityService.presentToast('Arrastra los elementos para ordenarlos', 'success-toast');
    }else{
      document.getElementById(`toggle-icon-${index}`).setAttribute('name', 'reorder-three-outline');
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
          await this.repositoryService.deleteElement(`clientsInTurn/${this.businessKey}/${turn.dateKey}/${turn.key}`);
          this.updateClientTurn(turn.dateKey);
          this.utilityService.closeLoading();
        });
      });
    });
  }

  reorderTurns(ev: CustomEvent<ItemReorderEventDetail>, dateKey: string) {
    this.turns[dateKey] = ev.detail.complete(this.turns[dateKey]);
    
    this.updateClientTurn(dateKey);
  }

  updateClientTurn(dateKey: string){
    const turnObject: AngularFireObject<any> = this.repositoryService.getAllElements(`clientsInTurn/${this.businessKey}/${dateKey}`);
    const turns$ = turnObject.snapshotChanges().subscribe(async result=>{
        const data = result.payload.val();
        const tempTurns = [];
        
        for(let turnKey in data){

          data[turnKey].key = turnKey;
          tempTurns.push(data[turnKey]);
          
        }

        turns$.unsubscribe();
        
        this.updateTurnService.updateTurn(tempTurns, this.businessKey, dateKey);
    });
  }

  async updateBusinessStatus(ev){
    await this.repositoryService.updateElement(`businessList/${this.businessKey}`, {
      isOpened: this.business.isOpened
    });
  }

  async setDiaryTurnLimit(ev){
    if(ev.target.value !== ""){
      this.repositoryService.updateElement(`businessList/${this.businessKey}`, {
        turnDiaryLimit: ev.target.value
      }).then(async () => {
        await this.utilityService.presentToast('Cambios guardados correctamente', 'success-toast');
      });
    } else{
      this.repositoryService.deleteElement(`businessList/${this.businessKey}/turnDiaryLimit`);
      await this.utilityService.presentToast('Debes escribir una cantidad', 'error-toast');
    }
  }

  ngOnDestroy(){
    this.turn$.unsubscribe();
  }
}
