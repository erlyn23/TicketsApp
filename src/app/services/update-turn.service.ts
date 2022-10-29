import { Injectable } from '@angular/core';
import { ITurn } from '../core/models/turn.interface';
import { RepositoryService } from './repository.service';

@Injectable({
    providedIn: 'root'
})
export class UpdateTurnService {
    
    constructor(private repositoryService: RepositoryService<ITurn>){

    }

    public updateTurn(turns: ITurn[], businessKey: string, dateKey: string){
        this.repositoryService.deleteElement(`clientsInTurn/${businessKey}/${dateKey}`).then(()=>{
            turns.forEach((turn, index) =>{
                let turnNum = index + 1;
                turn.key = `${turnNum}`;
                turn.turnNum = turnNum;
        
                this.repositoryService.setElement(`clientsInTurn/${businessKey}/${dateKey}/${turnNum}`, turn);
            });
        });
    }
}