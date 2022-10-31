import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IBusiness } from 'src/app/core/models/business.interface';
import { IEmployee } from 'src/app/core/models/employee.interface';
import { IServices } from 'src/app/core/models/services.interface';
import { ITurn } from 'src/app/core/models/turn.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UpdateTurnService } from 'src/app/services/update-turn.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
    selector: 'app-turns',
    templateUrl: './turns.component.html',
    styleUrls: ['./turns.component.scss']
})
export class TurnsComponent implements OnInit, OnDestroy{
    
    turnsRef: AngularFireObject<ITurn>;
    turns$: Subscription;
    turns: ITurn[] = [];
    serviceRef: AngularFireObject<IServices>;
    services$: Subscription;
    services: IServices[] = [];

    navigationExtras: NavigationExtras = { state: {business: null, origin: '' } }

    userUid: string;
    constructor(private repositoryService: RepositoryService<ITurn>,
        private servicesRepoService: RepositoryService<IServices>,
        private businessRepoService: RepositoryService<IBusiness>,
        private updateTurnService: UpdateTurnService,
        private angularFireDatabase: AngularFireDatabase,
        private utilityService: UtilityService,
        private authService: AuthService,
        private router: Router){

    }

    ngOnInit():void{

        this.userUid = this.authService.userData.uid;
        this.getMyTurns();
    }

    getMyTurns(){
        this.turnsRef = this.repositoryService.getAllElements(`clientsInTurn`);
        this.turns$ = this.turnsRef.snapshotChanges().subscribe(result=>{
            const turnList = result.payload.val();
            this.turns = [];
            for(let businessKey in turnList){
                for(let dateKey in turnList[businessKey]){
                    for(let turnKey in turnList[businessKey][dateKey]){

                        if(turnList[businessKey][dateKey][turnKey].clientKey === this.userUid){
                            turnList[businessKey][dateKey][turnKey].key = turnKey;
                            this.turns.push(turnList[businessKey][dateKey][turnKey]);
                            this.getServices(businessKey, turnList[businessKey][dateKey][turnKey].serviceKey);
                        }
                    }
                }
            }
        });
    }

    getServices(businessKey, serviceKey){
        this.serviceRef = this.servicesRepoService.getAllElements(`services/${businessKey}/${serviceKey}`);
        this.services$ = this.serviceRef.valueChanges().subscribe(result=>{
            this.services.push(result);
        });
    }

    goToBusinessDetails(businessKey: string){
        this.navigationExtras.state.origin = 'reserves';
        const businessObject: AngularFireObject<IBusiness> = this.businessRepoService.getAllElements(`businessList/${businessKey}`);
        const business$ = businessObject.valueChanges().subscribe(result=>{
            
            result.key = businessKey;
            this.navigationExtras.state.business = result;
            this.router.navigate(['/business-details'], this.navigationExtras);
            business$.unsubscribe();
        
        });
    }

    async confirmCancelTurn(businessKey: string){
        await this.utilityService.presentAlertWithActions('Confirmar', '¿Estás seguro de quere cancelar este turno?',
        ()=>{ this.searchClientEmployeeTurn(businessKey) }, ()=> { this.utilityService.closeAlert(); })
    }

    employeeClientTurnObject: AngularFireObject<ITurn>;
    searchClientEmployeeTurn(businessKey: string){
        this.employeeClientTurnObject = this.repositoryService.getAllElements(`clientsInTurn/${businessKey}`);
        const employeeClientTurn$ = this.employeeClientTurnObject.snapshotChanges().subscribe(result=>{
            if(result !== null){
                const data = result.payload.val();
                for(let dateKey in data){
                    for(let turnKey in data[dateKey]){
                        if(data[dateKey][turnKey].clientKey === this.userUid){
                            this.searchBusinessToUnreserveTurn(data[dateKey][turnKey].employeeKey, turnKey, businessKey, dateKey);
                            employeeClientTurn$.unsubscribe();
                            break;
                        }
                    }
                }
            }
        });
    }

    searchBusinessToUnreserveTurn(employeeKey: string, turnKey: string, businessKey:string, dateKey: string)
    {
        const previousQuantities: number[] = [];
        const businessObject: AngularFireObject<IBusiness> = this.businessRepoService.getAllElements(`businessList/${businessKey}`);
        const business$ = businessObject.valueChanges().subscribe(result=>{
            previousQuantities.push(result.clientsInTurn);
            this.searchEmployeeToUnreserveTurn(employeeKey, previousQuantities, turnKey, businessKey, dateKey);
            business$.unsubscribe();
        });
    }

    searchEmployeeToUnreserveTurn(employeeKey: string, previousQuantities: number[], turnKey: string, businessKey:string, dateKey: string){
        const employeeToUnsubscribeObjectRef: AngularFireObject<IEmployee> = this.angularFireDatabase.object(`businessList/${businessKey}/employees/${employeeKey}`);
        const employee$ = employeeToUnsubscribeObjectRef.valueChanges().subscribe(result=>{
            previousQuantities.push(result.clientsInTurn);
            this.unreserveTurn(employeeKey, previousQuantities, turnKey, businessKey, dateKey);
            employee$.unsubscribe();
        });
    }

    unreserveTurn(employeeKey: string, previousQuantities: number[], turnKey: string, businessKey:string, dateKey: string){

        const businessPreviousQuantity = previousQuantities[0];
        const employeePreviousQuantity = previousQuantities[1];

        this.repositoryService.deleteElement(`users/${this.userUid}/turnKeys/${businessKey}`).then(()=>{
            this.repositoryService.updateElement(`businessList/${businessKey}`,{
                clientsInTurn: businessPreviousQuantity - 1
            }).then(()=>{
                this.repositoryService.updateElement(`businessList/${businessKey}/employees/${employeeKey}`,{
                    clientsInTurn: employeePreviousQuantity - 1
                }).then(()=>{
                    this.repositoryService.deleteElement(`clientsInTurn/${businessKey}/${dateKey}/${turnKey}`);
                    this.updateTurns(businessKey, dateKey);
                });
            });
        });
    }


    updateTurns(businessKey:string, dateKey:string){
        const turnObject: AngularFireObject<any> = this.repositoryService.getAllElements(`clientsInTurn/${businessKey}/${dateKey}`);
        const turns$ = turnObject.snapshotChanges().subscribe(async result=>{
            const data = result.payload.val();

            const tempTurns = [];
            for(let turnKey in data){
                data[turnKey].key = turnKey;
                tempTurns.push(data[turnKey]);
            }
            turns$.unsubscribe();
            this.updateTurnService.updateTurn(tempTurns, businessKey, dateKey);
        });
    }

    ngOnDestroy():void{
        this.turns$.unsubscribe();
        this.services$.unsubscribe();
    }
}