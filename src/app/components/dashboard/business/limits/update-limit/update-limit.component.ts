import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ITurnLimit } from 'src/app/core/models/turn-limit.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-update-limit',
  templateUrl: './update-limit.component.html',
  styleUrls: ['./update-limit.component.scss'],
})
export class UpdateLimitComponent implements OnInit, OnDestroy {
  @Input('data') data: ITurnLimit;
  uid:string;

  turnLimitForm: FormGroup;
  constructor(private authService: AuthService, 
    private utilityService: UtilityService,
    private formBuilder: FormBuilder,
    private repositoryService: RepositoryService<ITurnLimit>) { }

  ngOnInit(): void {
    this.initForm();
    this.turnLimitForm.controls.limitQuantity.setValue(this.data.limitQuantity);
    this.turnLimitForm.controls.limitDate.setValue(this.data.limitDate);

    this.uid = this.authService.userData.uid;
  }

  initForm() {
    this.turnLimitForm = this.formBuilder.group({
      limitQuantity: ["", [Validators.required, Validators.min(1)]],
      limitDate: ["", [Validators.required]]
    });
  }

  async saveChanges(){
    await this.utilityService.presentLoading();
    const { limitQuantity, limitDate } = this.turnLimitForm.value;
    if(limitQuantity && limitDate){
      const actualDate = new Date();
      const toSend = new Date(limitDate);

      actualDate.setHours(0, 0, 0, 0);
      toSend.setHours(0, 0, 0, 0);

      if(limitQuantity <= 0) await this.utilityService.presentToast('El límite de turnos tiene que ser mayor a 0', 'error-toast');
      else if(actualDate > toSend) await this.utilityService.presentToast('La fecha no puede ser menor a la de hoy', 'error-toast');
      else if(limitQuantity > 0 &&  toSend > actualDate){
        await this.repositoryService.updateElement(`businessList/${this.uid}/turnLimits/${this.data.key}`, {
            limitDate: limitDate,
            limitQuantity: limitQuantity
        }).then(async ()=>{
            await this.utilityService.presentToast('Límite modificado correctamente', 'success-toast');
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

  ngOnDestroy(): void {
    
  }

}
