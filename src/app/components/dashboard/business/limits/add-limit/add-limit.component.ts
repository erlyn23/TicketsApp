import { Component, OnInit } from '@angular/core';
import { ITurnLimit } from 'src/app/core/models/turn-limit.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-add-limit',
  templateUrl: './add-limit.component.html',
  styleUrls: ['./add-limit.component.scss'],
})
export class AddLimitComponent implements OnInit {

  limitDate: Date;
  limitQuantity: number;
  userUid: string;
  constructor(private authService: AuthService, 
    private utilityService: UtilityService,
    private repositoryService: RepositoryService<ITurnLimit>) { }

  ngOnInit() {
    this.userUid = this.authService.userData.uid;

  }

  async saveTurnLimit() {
    await this.utilityService.presentLoading();
    if(this.limitQuantity && this.limitDate){
      const actualDate = new Date();
      const limitDate = new Date(this.limitDate);

      actualDate.setHours(0, 0, 0, 0);
      limitDate.setHours(0, 0, 0, 0);

      if(this.limitQuantity <= 0) await this.utilityService.presentToast('El límite de turnos tiene que ser mayor a 0', 'error-toast');
      else if(actualDate > limitDate) await this.utilityService.presentToast('La fecha no puede ser menor a la de hoy', 'error-toast');
      else if(this.limitQuantity > 0 &&  limitDate > actualDate){
        await this.repositoryService.pushElement(`businessList/${this.userUid}/turnLimits`, {
            limitDate: limitDate.toISOString(),
            limitQuantity: this.limitQuantity
        }).then(async ()=>{
            await this.utilityService.presentToast('Límite agregado correctamente', 'success-toast');
            this.utilityService.closeLoading();
            this.utilityService.closeModal();
        }).catch(async error=>{
            await this.utilityService.presentToast('Ha ocurrido un error', 'error-toast');
            this.utilityService.closeLoading();
            this.utilityService.closeModal();
        });
      }
    } else {
      await this.utilityService.presentToast('Debes escribir una fecha y una cantidad', 'error-toast');
      this.utilityService.closeLoading();
    } 
  }

  closeWindow(){
    this.utilityService.closeModal();
  }

}
