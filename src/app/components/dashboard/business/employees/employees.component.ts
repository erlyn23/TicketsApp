import { Component, OnInit } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { IEmployee } from 'src/app/core/models/employee.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';

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
    private repositoryService: RepositoryService<IEmployee[]>) { }

  ngOnInit() {
    const user = this.authService.userData;
    this.uid = user.uid;

    this.getEmployees();
  }

  getEmployees(){
    this.objectRef = this.repositoryService.getAllElements(`businessList/${this.uid}/employees`);
    this.employeesSubscription = this.objectRef.snapshotChanges().subscribe(result=>{
      const data = result.payload.val();

      for(let key in data){
        this.employeesList.push(data[key]);
      }
    });
  }

}
