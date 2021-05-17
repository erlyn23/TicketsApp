import { Component, OnInit } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { IEmployee } from 'src/app/core/models/employee.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';
import { AddEmployeeComponent } from './add-employee/add-employee.component';

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
  keys: string[] = [];

  constructor(private authService: AuthService, 
    private repositoryService: RepositoryService<IEmployee[]>,
    private utilityService: UtilityService) { }

  ngOnInit() {
    const user = this.authService.userData;
    this.uid = user.uid;

    this.getEmployees();
  }

  getEmployees(){
    this.objectRef = this.repositoryService.getAllElements(`businessList/${this.uid}/employees`);
    this.employeesSubscription = this.objectRef.snapshotChanges().subscribe(result=>{
      const data = result.payload.val();

      this.employeesList = [];
      this.keys = [];
      for(let key in data){
        this.employeesList.push(data[key]);
        this.keys.push(key);
      }
    });
  }

  async openAddEmployeeModal(){
    await this.utilityService.openModal(AddEmployeeComponent);
  }

  async openDeleteConfirm(index: number){
    await this.utilityService.presentAlertWithActions('Confirmar', 
    '¿Estás seguro de querer eliminar este empleado?',
    ()=> this.deleteEmployee(index),
    ()=> this.cancelDeleteEmployee());
  }

  async deleteEmployee(index: number){
    const employeeKey = this.keys[index];
    await this.repositoryService.deleteElement(`businessList/${this.uid}/employees/${employeeKey}`).then(async ()=>{
      await this.utilityService.presentToast('Empleado eliminado correctamente', 'success-toast');
    }).catch(async err=>{
      await this.utilityService.presentToast('Ha ocurrido un error interno', 'error-toast');
    });
  }

  cancelDeleteEmployee(){
    this.utilityService.closeAlert();
  }

  ngOnDestroy(): void {
    this.employeesSubscription.unsubscribe();
  }
}
