import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit{
    
    password: string = "";
    confirmPassword: string = "";
    changePasswordForm: FormGroup;
    private passwordPattern: RegExp = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])");
    constructor(private formBuilder: FormBuilder,
        private angularFireAuth: AngularFireAuth,
        private utilityService: UtilityService) { }
    
    ngOnInit():void{
        this.initForm();
    }

    private initForm():void{
        this.changePasswordForm = this.formBuilder.group({
            password: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(this.passwordPattern)]],
            confirmPassword: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(this.passwordPattern)]]      
        })
    }

    isValidField(field: string): string{
        const validField: AbstractControl = this.changePasswordForm.get(field);
    
        return (!validField.valid && validField.touched) ? 'invalid-field' : validField.touched ? 'valid-field' : '';
    }

    async changePassword(){
        if(this.changePasswordForm.valid){
            if(this.changePasswordForm.value.password === this.changePasswordForm.value.confirmPassword){
                (await this.angularFireAuth.currentUser).updatePassword(this.changePasswordForm.value.password).then(async ()=>{
                    this.changePasswordForm.reset();
                    await this.utilityService.presentToast('Contraseña cambiada correctamente', 'success-toast');
                }).catch(async err=>{
                    console.log(err);
                    await this.utilityService.presentToast('Hubo un error interno al actualizar contraseña', 'error-toast');
                })
            }else{
                await this.utilityService.presentToast('Las contraseñas no coinciden', 'error-toast');
            }
        }else{
            await this.utilityService.presentToast('Debes escribir las contraseñas', 'error-toast');
        }
    }

    closeModal(){
        this.utilityService.closeModal();
    }
    
}