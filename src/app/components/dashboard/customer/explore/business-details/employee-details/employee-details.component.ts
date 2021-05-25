import { OnInit, Component, Input, ViewChild } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { IonSlides } from '@ionic/angular';
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

    @ViewChild('slideCtrl') slideCtrl: IonSlides;

    employeeDetailPage: string = 'employeeInfo';

    objectRef: AngularFireObject<IEmployee>;

    dbEmployee: IEmployee = {rating: 0, fullName: '', clientsInTurn: 0, comments: [], employeeSpecialty: ''};

    userUid: string;
    userRef: AngularFireObject<IUser>;
    isInTurn: boolean = false; 

    reserveDate: string = (new Date()).toISOString();

    comment: string;
    employeeComments: IEmployeeComments[];


    employeeSubscription: Subscription;
    userSubscription: Subscription;

    clientPhoto: string;

    constructor(private utilityServie: UtilityService,
    private repositoryService: RepositoryService<IEmployee>,
    private userRepoService: RepositoryService<IUser>,
    private utilityService: UtilityService,
    private angularFireDatabase: AngularFireDatabase,
    private authService: AuthService){
    }

    ngOnInit():void{
        
    }
    ionViewWillEnter() {
        const user = this.authService.userData;
        this.userUid = user.uid;
        
        this.getEmployeeDetails();
        this.getCurrentUserTurn();
        this.getClientPhoto();
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

    getClientPhoto(){
        const object: AngularFireObject<IUser> = this.angularFireDatabase.object(`users/${this.userUid}`);
        const user$ = object.valueChanges().subscribe(result=>{
            this.clientPhoto = result.photo;
            user$.unsubscribe();
        });
    }

    getCurrentUserTurn(){
        this.userRef = this.userRepoService.getAllElements(`users/${this.userUid}`);
        this.userSubscription = this.userRef.valueChanges().subscribe(result=>{
            this.isInTurn = result.isInTurn;
        });
    }

    setSlide(ev){
        if(ev.detail.value === 'employeeInfo') this.slideCtrl.slideTo(0, 400);
        else this.slideCtrl.slideTo(1, 400);
    }

    setSegment(ev){
        this.slideCtrl.getActiveIndex().then(index=>{
            if(index === 0) this.employeeDetailPage = 'employeeInfo'; 
            else this.employeeDetailPage = 'employeeComments';
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
            
            let thanks = document.createElement('span');
            thanks.style.color = "black";
            thanks.innerText = "Gracias por tu calificación";
            document.getElementsByClassName('rating-content')[0].appendChild(thanks);
        });
    }

    async reserveTurn(clientPhoto: string, previousQuantity: number){
        const actualDate = new Date();
        const sendedDate = new Date(this.reserveDate);
        actualDate.setHours(0,0,0,0);
        sendedDate.setHours(0,0,0,0);

        if(sendedDate < actualDate) await this.utilityService.presentToast('La fecha debe ser igual o adelantada a la de hoy', 'error-toast');
        else{
            await this.utilityService.presentLoading();
            await this.repositoryService.updateElement(`users/${this.userUid}`, {
                isInTurn: true
            }).then(async ()=>{

                let turnInfo = {
                    employeeName: this.data.fullName,
                    clientName: this.authService.userData.displayName,
                    clientKey: this.authService.userData.uid,
                    clientPhoto: clientPhoto,
                    employeeKey: this.data.key,
                    reserveDate: this.reserveDate
                };

                if(clientPhoto === undefined) delete turnInfo['clientPhoto'];

                await this.repositoryService.updateElement(`clientsInTurn/${this.additionalKey}/${this.userUid}`, turnInfo).then(async ()=>{
                    await this.repositoryService.updateElement(`businessList/${this.additionalKey}/employees/${this.data.key}`,{
                        clientsInTurn: previousQuantity + 1
                    }).then(async ()=>{
                        this.utilityService.presentToast('Turno reservado correctamente', 'success-toast');
                        this.utilityService.closeLoading();
                    });
                }).catch(err=>{
                    this.utilityService.presentToast('Ha ocurrido un error al reservar turno', 'error-toast');
                    this.utilityService.closeLoading();
                });
            }).catch(err=>{
                this.utilityService.presentToast('Ha ocurrido un error al reservar turno', 'error-toast');
                this.utilityService.closeLoading();
            });
        }
    }

    employeeClientTurnObject: AngularFireObject<ITurn>;
    searchClientEmployeeTurn(){
        this.employeeClientTurnObject = this.angularFireDatabase.object(`clientsInTurn`);
        const employeeClientTurn$ = this.employeeClientTurnObject.snapshotChanges().subscribe(result=>{
            if(result !== null){
                const data = result.payload.val();
                for(let businessKey in data){
                    if(data[businessKey][this.userUid] !== undefined){
                        this.searchEmployeeToUnreserveTurn(data[businessKey][this.userUid].employeeKey, businessKey);
                        employeeClientTurn$.unsubscribe();
                        break;
                    }
                }
            }
        });
    }

    searchEmployeeToUnreserveTurn(employeeKey: string, businessKey: string){
        const employeeToUnsubscribeObjectRef: AngularFireObject<IEmployee> = this.angularFireDatabase.object(`businessList/${businessKey}/employees/${employeeKey}`);
        const employee$ = employeeToUnsubscribeObjectRef.valueChanges().subscribe(result=>{
            this.unreserveTurn(employeeKey, businessKey, result.clientsInTurn)
            employee$.unsubscribe();
        });
    }

    unreserveTurn(employeeKey: string, businessKey: string, previousQuantity: number){
        this.repositoryService.updateElement(`users/${this.userUid}`, {
            isInTurn: false
        }).then(()=>{
           this.repositoryService.updateElement(`businessList/${businessKey}/employees/${employeeKey}`,{
            clientsInTurn: previousQuantity - 1
           }).then(()=>{
            this.repositoryService.deleteElement(`clientsInTurn/${businessKey}/${this.userUid}`);
           });
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

    ionViewWillLeave() {
        this.employeeSubscription.unsubscribe();
        this.userSubscription.unsubscribe();
    }
}