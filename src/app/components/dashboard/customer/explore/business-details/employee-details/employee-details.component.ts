import { OnInit, Component, Input, ViewChild, OnDestroy } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { IonSlides } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { IBusiness } from 'src/app/core/models/business.interface';
import { IEmployeeComments } from 'src/app/core/models/employee-comments.interface';
import { IEmployee } from 'src/app/core/models/employee.interface';
import { INotificationBody } from 'src/app/core/models/notification-body.interface';
import { IServices } from 'src/app/core/models/services.interface';
import { ITurn } from 'src/app/core/models/turn.interface';
import { IUser } from 'src/app/core/models/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UpdateTurnService } from 'src/app/services/update-turn.service';
import { UtilityService } from 'src/app/services/utility.service';
 
@Component({
    selector: 'app-employee-details',
    templateUrl: './employee-details.component.html',
    styleUrls: ['./employee-details.component.scss']
})

export class EmployeeDetailsComponent implements OnInit, OnDestroy{
    
    @Input() data: IEmployee;
    @Input() additionalKey: string;

    @ViewChild('slideCtrl') slideCtrl: IonSlides;

    employeeDetailPage: string = 'employeeInfo';

    objectRef: AngularFireObject<IEmployee>;
    servicesRef: AngularFireObject<IServices>;
    userRef: AngularFireObject<IUser>;
    businessRef: AngularFireObject<IBusiness>;

    dbEmployee: IEmployee = {rating: 0, fullName: '', clientsInTurn: 0, comments: [], employeeSpecialty: ''};
    services: IServices[] = [];

    userUid: string;
    isInTurn: boolean = false; 
    turnsLimit: number = 0;

    reserveDate: string = (new Date()).toISOString();
    reserveHour: string = (new Date()).toISOString();
    serviceKey: string = "";

    comment: string;
    employeeComments: IEmployeeComments[];


    employeeSubscription: Subscription;
    turnLimitSubscription: Subscription;

    clientPhoto: string;
    constructor(private utilityServie: UtilityService,
    private repositoryService: RepositoryService<IEmployee>,
    private servicesRepoService: RepositoryService<IServices>,
    private businessRepository: RepositoryService<IBusiness>,
    private updateTurnService: UpdateTurnService,
    private utilityService: UtilityService,
    private angularFireDatabase: AngularFireDatabase,
    private notificationService: NotificationService,
    private authService: AuthService){
    }

    ngOnInit():void{
        const user = this.authService.userData;
        this.userUid = user.uid;
        
        this.getEmployeeDetails();
        this.getClientPhoto();
        this.getBusinessServices();
        this.getTurnsLimit();
        this.searchForPreviousTurn();
    }

    user$: Subscription;
    searchForPreviousTurn(){
        const userObject: AngularFireObject<IUser> = this.angularFireDatabase.object(`users/${this.userUid}/turnKeys`);
        this.user$ = userObject.snapshotChanges().subscribe(async result=>{
            const turnKeysList = result.payload.val();
            if(result!== undefined){
                let founded: number = 0;
                for(let businessKey in turnKeysList){
                    if(this.additionalKey === businessKey){
                        founded++;
                    }
                }
                this.isInTurn = (founded > 0);
            }else{
                this.isInTurn = false;
            }
        });
    }

    getBusinessServices(){
        this.servicesRef = this.servicesRepoService.getAllElements(`services/${this.additionalKey}`);
        const services$ = this.servicesRef.snapshotChanges().subscribe(result=>{
            const services = result.payload.val();
            this.services = [];
            for(let serviceKey in services){
                services[serviceKey].key = serviceKey;
                this.services.push(services[serviceKey]);
            }
            services$.unsubscribe();
        });
    }

    getTurnsLimit(){
        this.businessRef = this.businessRepository.getAllElements(`businessList/${this.additionalKey}`);
        this.turnLimitSubscription = this.businessRef.valueChanges().subscribe(business => {
            this.turnsLimit = (business.turnDiaryLimit) ? parseInt(business.turnDiaryLimit.toString()) : 0;
        });
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

    searchForBusinessPreviousQuantity(clientPhoto: string, previousQuantity: number){
        const reserveDateKey = this.getReserveDateKey();

        const turnFireObject: AngularFireObject<ITurn> = this.angularFireDatabase.object(`clientsInTurn/${this.additionalKey}/${reserveDateKey}`);
        const turn$ = turnFireObject.snapshotChanges().subscribe(async result=>{
            const turnList = result.payload.val();
            let turnsCounter = 0;
            
            for(let reserveKey in turnList)
                turnsCounter++;

            const turnNum = (result) ? turnsCounter : 0;
            await this.reserveTurn(clientPhoto, turnNum, previousQuantity);
            turn$.unsubscribe();

        }, error => {
            console.log(error);
            this.showErrorMessage();
        });
    }

    async reserveTurn(clientPhoto: string, businessPreviousQuantity: number, previousQuantity: number){
        const actualDate = new Date();
        const sendedDate = new Date(this.reserveDate);
        actualDate.setHours(0,0,0,0);
        sendedDate.setHours(0,0,0,0);

        const actualHour = new Date();
        const sendedHour = new Date(this.reserveHour);


        const isToday = (actualDate.getDate() == sendedDate.getDate() 
        && actualDate.getMonth() == sendedDate.getMonth() 
        && actualDate.getFullYear() == sendedDate.getFullYear())

        if(isToday && businessPreviousQuantity + 1 > this.turnsLimit) await this.utilityService.presentToast('Ya no se pueden reservar más turnos en este negocio', 'error-toast');
        else if(sendedDate < actualDate && sendedHour < actualHour) await this.utilityService.presentToast('La fecha y la hora deben ser iguales o adelantadas a la de hoy', 'error-toast');
        else if(this.serviceKey.length === 0) await this.utilityService.presentToast('Debes elegir un servicio', 'error-toast');
        else{
            await this.utilityService.presentLoading();
            this.repositoryService.setElement(`users/${this.userUid}/turnKeys/${this.additionalKey}`, {
                businessTurnKey: this.additionalKey
            }).then(async ()=>{

                let turnInfo: ITurn = {
                    key: `${businessPreviousQuantity + 1}`,
                    employeeName: this.data.fullName,
                    clientName: this.authService.userData.displayName,
                    clientKey: this.authService.userData.uid,
                    clientPhoto: clientPhoto,
                    employeeKey: this.data.key,
                    reserveDate: this.reserveDate,
                    reserveHour: this.reserveHour,
                    businessName: this.utilityService.getBusinessName(),
                    turnNum: businessPreviousQuantity + 1,
                    businessKey: this.additionalKey,
                    serviceKey: this.serviceKey,
                    dateKey: this.getReserveDateKey()
                };
                if(clientPhoto === undefined) delete turnInfo['clientPhoto'];

                const reserveDateKey = this.getReserveDateKey();
                this.repositoryService.updateElement(`clientsInTurn/${this.additionalKey}/${reserveDateKey}/${businessPreviousQuantity + 1}`, turnInfo).then(()=>{
                    this.repositoryService.updateElement(`businessList/${this.additionalKey}`,{
                        clientsInTurn: businessPreviousQuantity + 1
                    }).then(()=>{
                        this.repositoryService.updateElement(`businessList/${this.additionalKey}/employees/${this.data.key}`,{
                            clientsInTurn: previousQuantity + 1
                        }).then(async ()=>{
                            await this.utilityService.presentToast('Turno reservado correctamente', 'success-toast');
                            this.utilityService.closeLoading();

                            this.businessRef = this.businessRepository.getAllElements(`businessList/${this.additionalKey}`);
                            const business$ = this.businessRef.valueChanges().subscribe(business => {
                                const notification: INotificationBody = {
                                    token: business.notificationToken,
                                    notification: {
                                        title: 'Nuevo turno reservado en su negocio',
                                        body: 'Un cliente ha reservado un turno en tu negocio'
                                    }
                                };
                                this.notificationService.sendNotification(notification);
                                business$.unsubscribe();
                            });
                        });
                    }).catch(async err=>{
                        this.angularFireDatabase.database.ref('logs').push({
                            logDate: new Date().toISOString(),
                            message: err.message
                        })
                        await this.showErrorMessage();   
                    })
                }).catch(async err=>{
                    this.angularFireDatabase.database.ref('logs').push({
                        logDate: new Date().toISOString(),
                        message: err.message
                    })
                    await this.showErrorMessage();
                });
            }).catch(async err=>{
                this.angularFireDatabase.database.ref('logs').push({
                    logDate: new Date().toISOString(),
                    message: err.message
                })
                await this.showErrorMessage();
            });
        }
    }

    getReserveDateKey(){
        const dateToReserve = new Date(this.reserveDate);
        return `${dateToReserve.getDate()}${dateToReserve.getMonth() + 1}${dateToReserve.getFullYear()}`;
    }

    async showErrorMessage()
    {
        await this.utilityService.presentToast('Ha ocurrido un error al reservar turno', 'error-toast');
        this.utilityService.closeLoading();
    }

    employeeClientTurnObject: AngularFireObject<ITurn>;
    searchClientEmployeeTurn(){
        this.employeeClientTurnObject = this.angularFireDatabase.object(`clientsInTurn/${this.additionalKey}`);
        const employeeClientTurn$ = this.employeeClientTurnObject.snapshotChanges().subscribe(result=>{
            if(result !== null){
                const data = result.payload.val();
                for(let dateKey in data){
                    for(let turnKey in data[dateKey]){

                        const turn: ITurn = data[dateKey][turnKey];
                        if(turn.clientKey === this.userUid){
                            this.searchBusinessToUnreserveTurn(turn.employeeKey, turnKey, dateKey);
                            employeeClientTurn$.unsubscribe();
                            break;
                        }
                    }
                }
            }
        });
    }

    searchBusinessToUnreserveTurn(employeeKey: string, turnKey: string, dateKey: string)
    {
        const previousQuantities: number[] = [];
        const businessObject: AngularFireObject<IBusiness> = this.angularFireDatabase.object(`businessList/${this.additionalKey}`);
        const business$ = businessObject.valueChanges().subscribe(result=>{
            previousQuantities.push(result.clientsInTurn);
            this.searchEmployeeToUnreserveTurn(employeeKey, previousQuantities, turnKey, dateKey);
            business$.unsubscribe();
        });
    }

    searchEmployeeToUnreserveTurn(employeeKey: string, previousQuantities: number[], turnKey: string, dateKey: string){
        const employeeToUnsubscribeObjectRef: AngularFireObject<IEmployee> = this.angularFireDatabase.object(`businessList/${this.additionalKey}/employees/${employeeKey}`);
        const employee$ = employeeToUnsubscribeObjectRef.valueChanges().subscribe(result=>{
            previousQuantities.push(result.clientsInTurn);
            this.unreserveTurn(employeeKey, previousQuantities, turnKey, dateKey);
            employee$.unsubscribe();
        });
    }

    unreserveTurn(employeeKey: string, previousQuantities: number[], turnKey: string, dateKey: string){

        const businessPreviousQuantity = previousQuantities[0];
        const employeePreviousQuantity = previousQuantities[1];

        this.repositoryService.deleteElement(`users/${this.userUid}/turnKeys/${this.additionalKey}`).then(()=>{
            this.repositoryService.updateElement(`businessList/${this.additionalKey}`,{
                clientsInTurn: businessPreviousQuantity - 1
            }).then(()=>{
                this.repositoryService.updateElement(`businessList/${this.additionalKey}/employees/${employeeKey}`,{
                    clientsInTurn: employeePreviousQuantity - 1
                }).then(()=>{
                    this.repositoryService.deleteElement(`clientsInTurn/${this.additionalKey}/${dateKey}/${turnKey}`);
                    this.updateTurns(dateKey);
                });
            });
        });
    }

    updateTurns(dateKey: string){
        const turnObject: AngularFireObject<any> = this.repositoryService.getAllElements(`clientsInTurn/${this.additionalKey}/${dateKey}`);
        const turns$ = turnObject.snapshotChanges().subscribe(async result=>{
            const data = result.payload.val();
            const tempTurns = [];
            for(let turnKey in data){
                    
                data[turnKey].key = turnKey;
                tempTurns.push(data[turnKey]);
            }
            turns$.unsubscribe();

            this.updateTurnService.updateTurn(tempTurns, this.additionalKey, dateKey);
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

    ngOnDestroy():void{
        this.user$.unsubscribe();
        this.employeeSubscription.unsubscribe();
        this.turnLimitSubscription.unsubscribe();
    }
}