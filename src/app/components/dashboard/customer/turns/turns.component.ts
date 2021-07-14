import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { IServices } from 'src/app/core/models/services.interface';
import { ITurn } from 'src/app/core/models/turn.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';

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

    userUid: string;
    constructor(private repositoryService: RepositoryService<ITurn>,
        private servicesRepoService: RepositoryService<IServices>,
        private authService: AuthService){

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
                for(let turnKey in turnList[businessKey]){
                    if(turnList[businessKey][turnKey].clientKey === this.userUid){
                        turnList[businessKey][turnKey].key = turnKey;
                        this.turns.push(turnList[businessKey][turnKey]);
                        this.getServices(businessKey, turnList[businessKey][turnKey].serviceKey);
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

    ngOnDestroy():void{
        this.turns$.unsubscribe();
        this.services$.unsubscribe();
    }
}