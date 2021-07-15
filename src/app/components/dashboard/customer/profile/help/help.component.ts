import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IUser } from 'src/app/core/models/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { SendMailService } from 'src/app/services/send-mail.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit, OnDestroy{
    
    helpForm: FormGroup;
    email: string;
    constructor(private formBuilder: FormBuilder,
        private utilityService: UtilityService,
        private sendMailService: SendMailService,
        private repositoryService: RepositoryService<IUser>,
        private authService: AuthService){

    }

    ngOnInit():void{
        this.initForm();
        this.email = this.authService.userData.email;
        this.getUserData();
    }

    private initForm(){
        this.helpForm = this.formBuilder.group({
            businessName: ["", [Validators.required]],
            helpType: [""],
            anotherReason: [""]
        });
    }

    isValidField(field:string): string{
        const validField = this.helpForm.get(field);

        return (validField.invalid && validField.touched) ? 'invalid-field' : validField.touched ? 'valid-field' : '';
    }

    userId: BehaviorSubject<number>;
    getUserData(){
        const userObject: AngularFireObject<IUser> = this.repositoryService.getAllElements(`users/${this.authService.userData.uid}`);
        const user$ = userObject.valueChanges().subscribe(async result=>{
            this.userId = new BehaviorSubject<number>(result.userId);
            user$.unsubscribe();
        });
    }

    async sendHelp(){
        await this.utilityService.presentLoading();
        if(this.helpForm.valid){
            if(this.helpForm.value.helpType.length === 0 && this.helpForm.value.anotherReason.length === 0)
                await this.utilityService.presentToast('Debes elegir un problema o escribir una razón', 'error-toast');
            else{
                if(this.helpForm.value.helpType.length !== 0){
                    this.getUserData();
                    let data = {
                        from: this.email, 
                        businessName: this.helpForm.value.businessName, 
                        problem: this.helpForm.value.helpType,
                        customerName: this.authService.userData.displayName,
                        customerId: this.userId.value
                    };
                    const sendMail$ = this.sendMailService.sendMail(data)
                    .subscribe(async response=>{
                        if(response.error === null){
                            await this.utilityService.presentSimpleAlert('Información', 'Problema reportado correctamente, pronto estaremos contactando contigo, gracias por tus comentarios');
                            sendMail$.unsubscribe();
                            this.utilityService.closeLoading();
                        }
                    },error=>{
                        console.log(error);
                        this.utilityService.closeLoading();
                    });
                }
                else {
                    this.getUserData();
                    let data = {
                        from: this.email, 
                        businessName: this.helpForm.value.businessName, 
                        problem: this.helpForm.value.anotherReason,
                        customerName: this.authService.userData.displayName,
                        customerId: this.userId.value
                    };
                    const sendMail$ = this.sendMailService.sendMail(data)
                    .subscribe(async result=>{
                        if(result.error === null){
                            await this.utilityService.presentSimpleAlert('Información', 'Problema reportado correctamente, pronto estaremos contactando contigo, gracias por tus comentarios');
                            this.utilityService.closeLoading();
                            sendMail$.unsubscribe();
                        }
                    })
                }
            }
        }else
            await this.utilityService.presentToast('Debes escribir el nombre del negocio', 'error-toast');
    }

    ngOnDestroy():void{

    }
}