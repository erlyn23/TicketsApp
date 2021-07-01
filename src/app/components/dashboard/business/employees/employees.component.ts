import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { IEmployee } from 'src/app/core/models/employee.interface';
import { ITurn } from 'src/app/core/models/turn.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { BEmployeeDetailsComponent } from './b-employee-details/b-employee-details.component';
import { UpdateEmployeeComponent } from './update-employee/update-employee.component';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
})
export class EmployeesComponent implements OnInit {

  employeesList: IEmployee[] = [];
  objectRef: AngularFireObject<IEmployee[]>;

  employeesSubscription: Subscription;

  uid: string;

  constructor(private authService: AuthService, 
    private repositoryService: RepositoryService<IEmployee[]>,
    private angularFireDatabase: AngularFireDatabase,
    private utilityService: UtilityService) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    const user = this.authService.userData;
    this.uid = user.uid;

    this.getEmployees();
  }

  getEmployees(){
    this.objectRef = this.repositoryService.getAllElements(`businessList/${this.uid}/employees`);
    this.employeesSubscription = this.objectRef.snapshotChanges().subscribe(result=>{
      const data = result.payload.val();

      this.employeesList = [];
      for(let key in data){
        data[key].key = key;
        this.employeesList.push(data[key]);
      }
    });
  }

  async openAddEmployeeModal(){
    await this.utilityService.openModal(AddEmployeeComponent);
  }

  async openUpdateEmployeeModal(employee: IEmployee){
    await this.utilityService.openModal(UpdateEmployeeComponent, employee);
  }

  async openDeleteConfirm(employee: IEmployee){
    await this.utilityService.presentAlertWithActions('Confirmar', 
    '¿Estás seguro de querer eliminar este empleado?',
    ()=> this.deleteEmployee(employee.key),
    ()=> this.cancelDeleteEmployee());
  }

  async deleteEmployee(employeeKey: string){
    const turnsRef: AngularFireObject<ITurn> = this.angularFireDatabase.object(`clientsInTurn/${this.uid}`);
    const turns$ = turnsRef.snapshotChanges().subscribe(result=>{
      const data = result.payload.val();
      for(let key in data){
        if(data[key].employeeKey === employeeKey){
          this.utilityService.presentToast('Este empletado tiene turnos, no puedes eliminarlo', 'error-toast');
          turns$.unsubscribe();
          break;
        }else{
          this.repositoryService.deleteElement(`businessList/${this.uid}/employees/${employeeKey}`).then(async ()=>{
            await this.utilityService.presentToast('Empleado eliminado correctamente', 'success-toast');
            turns$.unsubscribe();
          }).catch(async err=>{
            await this.utilityService.presentToast('Ha ocurrido un error interno', 'error-toast');
            turns$.unsubscribe();
          });
          break;
        }
      }
    });
  }

  async goToEmployeeDetails(employee: IEmployee){
    await this.utilityService.openModal(BEmployeeDetailsComponent, employee);
  }

  cancelDeleteEmployee(){
    this.utilityService.closeAlert();
  }

  ionViewWillLeave() {
    this.employeesSubscription.unsubscribe();
  }
}
