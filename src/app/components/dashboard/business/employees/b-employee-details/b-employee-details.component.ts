import { Component, Input, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { IEmployeeComments } from 'src/app/core/models/employee-comments.interface';
import { IEmployee } from 'src/app/core/models/employee.interface';
import { IUser } from 'src/app/core/models/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
    selector: 'app-b-employee-details',
    templateUrl: './b-employee-details.component.html',
    styleUrls: ['./b-employee-details.component.scss']
})
export class BEmployeeDetailsComponent implements OnInit{

    @Input() data: IEmployee;

    employeeDetailPage: string = 'employeeInfo';

    objectRef: AngularFireObject<IEmployee>;

    dbEmployee: IEmployee = {rating: 0, fullName: '', clientsInTurn: 0, comments: []};

    userUid: string;

    clientsInTurnCount: number = 0;
    clientsCountRef: AngularFireObject<any>;

    employeeComments: IEmployeeComments[];


    employeeSubscription: Subscription;
    clientsInTurnCountSubscription: Subscription;

    constructor(private utilityServie: UtilityService,
    private repositoryService: RepositoryService<IEmployee>,
    private angularFireDatabase: AngularFireDatabase,
    private authService: AuthService){
    }

    ngOnInit():void{
        const user = this.authService.userData;
        this.userUid = user.uid;

        this.getEmployeeDetails();
        this.getClientsInTurnCount();
    }

    getEmployeeDetails(){
        this.objectRef = this.repositoryService.getAllElements(`businessList/${this.userUid}/employees/${this.data.key}`);
        this.employeeSubscription = this.objectRef.valueChanges().subscribe(result=>{
            this.dbEmployee = result;
            this.employeeComments = [];
            for(let comment in this.dbEmployee.comments){
                this.employeeComments.push(this.dbEmployee.comments[comment]);
            }
        });
    }

    getClientsInTurnCount(){
        this.clientsCountRef = this.angularFireDatabase.object(`clientsInTurn/${this.userUid}`);
        this.clientsInTurnCountSubscription = this.clientsCountRef.snapshotChanges().subscribe(result=>{
            const data = result.payload.val();
            this.clientsInTurnCount = 0;
            for(let clientKey in data){
                if(data[clientKey].employeeKey === this.data.key){
                    this.clientsInTurnCount++;
                    this.repositoryService.updateElement(`businessList/${this.userUid}/employees/${this.data.key}`,{
                        clientsInTurn: this.clientsInTurnCount
                    });
                }
            }
        });
    }

    closeModal(){
        this.utilityServie.closeModal();  
    }

    ngOnDestroy(): void {
        this.employeeSubscription.unsubscribe();
        this.clientsInTurnCountSubscription.unsubscribe();
    }
}