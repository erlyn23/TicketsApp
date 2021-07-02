import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IServices } from 'src/app/core/models/services.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.component.html',
  styleUrls: ['./add-service.component.scss'],
})
export class AddServiceComponent implements OnInit {

  serviceForm: FormGroup;
  userUid: string;
  constructor(private repositoryService: RepositoryService<IServices>,
    private authService: AuthService,
    private utilityService: UtilityService,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.initForm();
    this.userUid = this.authService.userData.uid;
  }

  private initForm():void{
    this.serviceForm = this.formBuilder.group({
      service: ["", [Validators.required]],
      price: ["", [Validators.required]]
    });
  }

  async addService(){
    await this.utilityService.presentLoading();
    if(this.serviceForm.valid){
      this.repositoryService.pushElement(`services/${this.userUid}`,{
        service: this.serviceForm.value.service,
        price: this.serviceForm.value.price
      }).then(async ()=>{
        await this.utilityService.presentToast('Servicio agregado correctamente', 'success-toast');
        this.utilityService.closeLoading();
        this.closeWindow();
      }).catch(async error=>{
        console.log(error);
        await this.utilityService.presentToast('Ha ocurrido un error al guardar servicio', 'error-toast');
        this.utilityService.closeLoading();
      });
    }
    else{
      await this.utilityService.presentToast('Escribe un servicio y el precio', 'error-toast');
      this.utilityService.closeLoading();
    }
  }

  closeWindow(){
    this.utilityService.closeModal();
  }

}
