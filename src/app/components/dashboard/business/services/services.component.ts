import { Component, OnInit } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { IServices } from 'src/app/core/models/services.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';
import { AddServiceComponent } from './add-service/add-service.component';
import { UpdateServiceComponent } from './update-service/update-service.component';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit {

  userUid: string;
  services: IServices[] = [];
  servicesObjectRef: AngularFireObject<IServices[]>;
  services$: Subscription;

  constructor(private authService: AuthService, 
    private repositoryService: RepositoryService<IServices[]>,
    private utilityService: UtilityService) { }

  ngOnInit() {
    this.userUid = this.authService.userData.uid;
    this.getServices();
  }

  getServices(){
    this.servicesObjectRef = this.repositoryService.getAllElements(`services/${this.userUid}`);
    this.services$ = this.servicesObjectRef.snapshotChanges().subscribe(result=>{
      const servicesList = result.payload.val();
      this.services = [];
      for(let serviceKey in servicesList){
        servicesList[serviceKey].key = serviceKey;
        this.services.push(servicesList[serviceKey]);
      }
    });
  }

  async openAddServiceModal(){
    await this.utilityService.openModal(AddServiceComponent);
  }

  async openDeleteConfirm(service: IServices){
    await this.utilityService.presentAlertWithActions('Confirmar', 
    '¿Quieres eliminar este servicio? No podrás recuperarlo',
    async ()=> await this.deleteService(service.key),
    ()=> this.utilityService.closeAlert());
  }

  async deleteService(serviceKey: string){
    await this.utilityService.presentLoading();

    this.repositoryService.deleteElement(`services/${this.userUid}/${serviceKey}`).then(async ()=>{
      await this.utilityService.presentToast('Servicio eliminado correctamente', 'success-toast');
      this.utilityService.closeLoading();
    }).catch(async error=>{
      console.log(error);
      await this.utilityService.presentToast('Ha ocurrido un error al eliminar servicio', 'error-toast');
      this.utilityService.closeLoading();
    });
  }

  async openUpdateModal(service: IServices){
    await this.utilityService.openModal(UpdateServiceComponent, service);
  }

  ionViewWillLeave() {
    this.services$.unsubscribe();
  }

}
