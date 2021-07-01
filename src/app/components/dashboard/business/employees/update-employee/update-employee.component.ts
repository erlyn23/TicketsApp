import { Component, Input, OnInit } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IEmployee } from 'src/app/core/models/employee.interface';
import { ITurn } from 'src/app/core/models/turn.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-update-employee',
  templateUrl: './update-employee.component.html',
  styleUrls: ['./update-employee.component.scss'],
})
export class UpdateEmployeeComponent implements OnInit {

  @Input('data') data: IEmployee;

  employeeName: string = "";
  employeeSpecialty: string = "";
  userUid: string;
  turns: ITurn[] = [];
  turnsObject: AngularFireObject<ITurn[]>;
  turns$: Subscription;

  employeeForm: FormGroup;
  constructor(private authService: AuthService, 
      private utilityService: UtilityService,
      private formBuilder: FormBuilder,
      private repositoryService: RepositoryService<any>){}

  ngOnInit():void{
      
      const user = this.authService.userData;
      this.userUid = user.uid;
      this.initForm();
      this.employeeForm.value.employeeName = this.data.fullName;
      this.employeeForm.value.employeeSpecialty = this.data.employeeSpecialty;

      this.employeeForm.controls.employeeName.setValue(this.data.fullName);
      this.employeeForm.controls.employeeSpecialty.setValue(this.data.employeeSpecialty);
      this.getTurns();
  }

  getTurns(){
    this.turnsObject = this.repositoryService.getAllElements(`clientsInTurn/${this.userUid}`);
    this.turns$ = this.turnsObject.snapshotChanges().subscribe(result=>{
      const turnsList = result.payload.val();
      this.turns = [];
      for(let turn of turnsList) if(turn!==undefined) this.turns.push(turn);
    });
  }
  
  ionViewWillEnter() {
  }

  private initForm():void{
      this.employeeForm = this.formBuilder.group({
          employeeName: ["", [Validators.required]],
          employeeSpecialty: ["", [Validators.required]]
      });
  }
  async saveChanges(){
      await this.utilityService.presentLoading();
      if(this.employeeForm.valid){
          await this.repositoryService.updateElement(`businessList/${this.userUid}/employees/${this.data.key}`, {
              fullName: this.employeeForm.value.employeeName,
              employeeSpecialty: this.employeeForm.value.employeeSpecialty
          }).then(async ()=>{

              if(this.data.clientsInTurn > 0){
                this.updateEmployeeFromTurnList();
              }

              await this.utilityService.presentToast('Empleado modificado correctamente', 'success-toast');
              this.utilityService.closeLoading();
              this.utilityService.closeModal();
          }).catch(async error=>{
              await this.utilityService.presentToast('Ha ocurrido un error', 'error-toast');
              this.utilityService.closeLoading();
              this.utilityService.closeModal();
          });
      }else{
          await this.utilityService.presentToast('Debes escribir el nombre del empleado y su especialidad', 'error-toast');
          this.utilityService.closeLoading();
      }
  }

  updateEmployeeFromTurnList(){
    for(let turn of this.turns){
      if(turn.employeeKey === this.data.key){
        this.repositoryService.updateElement(`clientsInTurn/${this.userUid}/${turn.key}`, {
          employeeName: this.employeeForm.value.employeeName
        });
      }
    }
  }

  closeWindow(){
    this.utilityService.closeModal();
  }

  ionViewWillLeave(){
    this.turns$.unsubscribe();
  }

  ngOnDestroy(): void{
    this.turns$.unsubscribe();
  }

}
