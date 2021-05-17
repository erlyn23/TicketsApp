import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { RepositoryService } from "src/app/services/repository.service";
import { UtilityService } from "src/app/services/utility.service";

@Component({
    selector: 'app-add-employee',
    templateUrl: './add-employee.component.html',
    styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent implements OnInit{

    employeeName: string;
    userUid: string;
    constructor(private authService: AuthService, 
        private utilityService: UtilityService,
        private repositoryService: RepositoryService<null>){}

    ngOnInit():void{
        const user = this.authService.userData;
        this.userUid = user.uid;
    }

    async saveEmployee(){
        await this.utilityService.presentLoading();
        if(this.employeeName.length > 0){
            await this.repositoryService.pushElement(`businessList/${this.userUid}/employees`, {
                fullName: this.employeeName,
                clientsInTurn: 0,
                rating: 0
            }).then(async ()=>{
                await this.utilityService.presentToast('Empleado agregado correctamente', 'success-toast');
                this.utilityService.closeLoading();
                this.utilityService.closeModal();
            }).catch(async error=>{
                await this.utilityService.presentToast('Ha ocurrido un error', 'error-toast');
                this.utilityService.closeLoading();
                this.utilityService.closeModal();
            });
        }else{
            await this.utilityService.presentToast('Debes escribir el nombre del empleado', 'error-toast');
            this.utilityService.closeLoading();
        }
    }

    closeWindow(){
        this.utilityService.closeModal();
    }
}