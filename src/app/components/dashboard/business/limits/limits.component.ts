import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { ITurnLimit } from 'src/app/core/models/turn-limit.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';
import { AddLimitComponent } from './add-limit/add-limit.component';
import { UpdateLimitComponent } from './update-limit/update-limit.component';

@Component({
  selector: 'app-limits',
  templateUrl: './limits.component.html',
  styleUrls: ['./limits.component.scss'],
})
export class LimitsComponent implements OnInit, OnDestroy {

  turnLimitObjectRef: AngularFireObject<ITurnLimit>;
  turnLimitSubscription: Subscription;

  turnLimits: ITurnLimit[] = [];

  uid: string;

  constructor(private limitsRepositoryService: RepositoryService<ITurnLimit>, 
    private utilityService: UtilityService,
    private userService: AuthService) { }

  ngOnInit() {
    this.uid = this.userService.userData.uid;

    this.getTurnLimits();
  }

  getTurnLimits(){
    this.turnLimitObjectRef = this.limitsRepositoryService.getAllElements(`businessList/${this.uid}/turnLimits`);
    this.turnLimitSubscription = this.turnLimitObjectRef.snapshotChanges().subscribe(result => {
      const turnLimits = result.payload.val();

      this.turnLimits = [];
      for(let turnLimitKey in turnLimits){
        turnLimits[turnLimitKey].key = turnLimitKey;
        this.turnLimits.push(turnLimits[turnLimitKey]);
      }
    });
  }

  async openAddTurnLimitModal(){
    await this.utilityService.openModal(AddLimitComponent);
  }

  async openUpdateTurnLimitModal(turnLimit: ITurnLimit){
    await this.utilityService.openModal(UpdateLimitComponent, turnLimit);
  }

  async openDeleteConfirm(turnLimit: ITurnLimit){
    await this.utilityService.presentAlertWithActions('Confirmar', '¿Estás seguro de querer eliminar este límite?',
    async () => { this.deleteTurnLimit(turnLimit.key) },
    () => { this.cancelDeleteTurnLimit(); })
  }

  deleteTurnLimit(key: string){
    this.limitsRepositoryService.deleteElement(`businessList/${this.uid}/turnLimits/${key}`).then(async () => {
      await this.utilityService.presentToast('Límite eliminado correctamente', 'success-toast');
    }).catch(async (err) => {
      await this.utilityService.presentToast('Error al eliminar límite', 'error-toast');
      this.limitsRepositoryService.pushElement(`logs`, {
        logDate: new Date().toISOString(),
        error: err
      });
    });
  }

  cancelDeleteTurnLimit(){
    this.utilityService.closeAlert();
  }

  ngOnDestroy(){ 
    this.turnLimitSubscription.unsubscribe();
  }
}
