import { OnInit, Component, Input } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { IEmployeeComments } from 'src/app/core/models/employee-comments.interface';
import { IEmployee } from 'src/app/core/models/employee.interface';
import { ITurn } from 'src/app/core/models/turn.interface';
import { IUser } from 'src/app/core/models/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';


@Component({
    selector: 'app-employee-details',
    templateUrl: './employee-details.component.html',
    styleUrls: ['./employee-details.component.scss']
})

export class EmployeeDetailsComponent implements OnInit{
    
    @Input() data: IEmployee;
    @Input() additionalKey: string;

    employeeDetailPage: string = 'employeeInfo';

    objectRef: AngularFireObject<IEmployee>;
    employeeSubscription: Subscription;

    dbEmployee: IEmployee = {rating: 0, fullName: '', clientsInTurn: 0, comments: []};

    userUid: string;
    userRef: AngularFireObject<IUser>;
    userSubscription: Subscription;
    isInTurn: boolean = false; 

    reserveDate: string = (new Date()).toISOString();

    clientsInTurnCount: number = 0;
    clientsCountRef: AngularFireObject<any>;
    clientsInTurnCountSubscription: Subscription;

    comment: string;
    employeeComments: IEmployeeComments[];

    constructor(private utilityServie: UtilityService,
    private repositoryService: RepositoryService<IEmployee>,
    private userRepoService: RepositoryService<IUser>,
    private utilityService: UtilityService,
    private angularFireDatabase: AngularFireDatabase,
    private authService: AuthService){
    }

    ngOnInit():void{
        const user = this.authService.userData;
        this.userUid = user.uid;

        this.getEmployeeDetails();
        this.getCurrentUserTurn();
        this.getClientsInTurnCount();
    }

    getEmployeeDetails(){
        this.objectRef = this.repositoryService.getAllElements(`businessList/${this.additionalKey}/employees/${this.data.key}`);
        this.employeeSubscription = this.objectRef.valueChanges().subscribe(result=>{
            this.dbEmployee = result;
            this.employeeComments = [];
            for(let comment in this.dbEmployee.comments){
                this.employeeComments.push(this.dbEmployee.comments[comment]);
            }
        });
    }

    getCurrentUserTurn(){
        this.userRef = this.userRepoService.getAllElements(`users/${this.userUid}`);
        this.userSubscription = this.userRef.valueChanges().subscribe(result=>{
            this.isInTurn = result.isInTurn;
        });
    }

    getClientsInTurnCount(){
        this.clientsCountRef = this.angularFireDatabase.object(`clientsInTurn/${this.additionalKey}`);
        this.clientsInTurnCountSubscription = this.clientsCountRef.snapshotChanges().subscribe(result=>{
            const data = result.payload.val();
            this.clientsInTurnCount = 0;
            for(let clientKey in data){
                if(data[clientKey].employeeKey === this.data.key){
                    this.clientsInTurnCount++;
                    this.repositoryService.updateElement(`businessList/${this.additionalKey}/employees/${this.data.key}`,{
                        clientsInTurn: this.clientsInTurnCount
                    });
                }
            }
        });
    }

    async rateEmployee(rate: number){
        await this.repositoryService.updateElement(`businessList/${this.additionalKey}/employees/${this.data.key}`,{
            rating: Math.round((this.data.rating + rate) / 2)
        }).then(()=>{
            let stars = document.getElementsByClassName('far');
            const totalStars = stars.length;
            for(let i = 0; i < totalStars; i++){
                stars[i].classList.add('animate__animated', 'animate__fadeOut');
            }
            document.getElementById("stars-content").remove();
            
            let thanks = document.createElement('h3');
            thanks.style.color = "black";
            thanks.innerText = "Gracias por tu calificación";
            document.getElementsByClassName('rating-content')[1].appendChild(thanks);
        });
    }

    async reserveTurn(){
        await this.utilityService.presentLoading();
        await this.repositoryService.updateElement(`users/${this.userUid}`, {
            isInTurn: true
        }).then(async ()=>{
            await this.repositoryService.updateElement(`clientsInTurn/${this.additionalKey}/${this.userUid}`,{
                employeeName: this.data.fullName,
                clientName: this.authService.userData.displayName,
                clientKey: this.authService.userData.uid,
                employeeKey: this.data.key,
                reserveDate: this.reserveDate
            }).then(()=>{
                this.utilityService.presentToast('Turno reservado correctamente', 'success-toast');
                this.utilityService.closeLoading();
            }).catch(err=>{
                this.utilityService.presentToast('Ha ocurrido un error al reservar turno', 'error-toast');
                this.utilityService.closeLoading();
            });
        }).catch(err=>{
            this.utilityService.presentToast('Ha ocurrido un error al reservar turno', 'error-toast');
            this.utilityService.closeLoading();
        });
    }

    async unreserveTurn(){
        await this.repositoryService.updateElement(`users/${this.userUid}`, {
            isInTurn: false
        }).then(()=>{
           this.repositoryService.deleteElement(`clientsInTurn/${this.additionalKey}/${this.userUid}`);
        });
    }

    async doComment(){
        if(this.comment !== undefined && this.comment !== ""){
            const newDate = new Date();
            const actualDate = `${newDate.getDate()}/${newDate.getMonth()+1}/${newDate.getFullYear()}`;
            await this.repositoryService.pushElement(`businessList/${this.additionalKey}/employees/${this.data.key}/comments`,{
                user: this.authService.userData.displayName,
                comment: this.comment,
                commentDate: actualDate
            }).then(()=>{
                this.comment = "";
            });
        }else{
            this.utilityService.presentToast('Debes escribir un comentario', 'error-toast');
        }
    }

    closeModal(){
        this.utilityServie.closeModal();  
    }

    ngOnDestroy(): void {
        this.employeeSubscription.unsubscribe();
        this.userSubscription.unsubscribe();
    }
}