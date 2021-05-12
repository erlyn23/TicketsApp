import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IAuth } from 'src/app/core/models/auth.interface';
import { IUser } from 'src/app/core/models/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-register-business',
  templateUrl: './register-business.component.html',
  styleUrls: ['./register-business.component.scss'],
})
export class RegisterBusinessComponent implements OnInit {
  registerForm: FormGroup;
  private passwordPattern: RegExp = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])");
  private emailPattern: RegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    private utilityService: UtilityService,
    private router: Router) { 
      const user = this.authService.userData;
      if(user){
        this.router.navigate(['/dashboard'])
      }
    }

  ngOnInit() {
    this.initForm();
  }

  private initForm():void{
    this.registerForm = this.formBuilder.group({
      fullName: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ["", [Validators.required, Validators.pattern(this.emailPattern)]],
      businessName: ["", [Validators.required]],
      address: ["", [Validators.required]],
      password: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(this.passwordPattern)]],
      confirmPassword: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(this.passwordPattern)]]
    });
  }

  isValidField(field: string): string{
    const validField: AbstractControl = this.registerForm.get(field);

    return (!validField.valid && validField.touched) ? 'invalid-field' : validField.touched ? 'valid-field' : '';
  }

  verifyPasswords(event: CustomEvent): string{
    const password = this.registerForm.value.password;
    const confirmPassword = this.registerForm.value.confirmPassword; 
    if(password != "" || confirmPassword != "")
     return (password != confirmPassword) ? 'invalid-field' : 'valid-field';
  }

  async registerUser(){
    await this.utilityService.presentLoading();
    if(this.registerForm.valid){
      
      if(this.registerForm.value.password === this.registerForm.value.confirmPassword){
        
        const user: IUser = { fullName: this.registerForm.value.fullName,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        businessName: this.registerForm.value.businessName,
        address: this.registerForm.value.address,
        isBusiness: true };
        
        await this.authService.registerUser(user).then(async ()=>{
          
          this.registerForm.reset();
          this.utilityService.closeLoading();
          await this.utilityService.presentToast('Usuario creado correctamente', 'success-toast');
        
        }).catch(async error=>{
          
          await this.utilityService.presentToast('Ha ocurrido un error al crear usuario', 'error-toast');
          this.utilityService.closeLoading();
        
        });
      }else{
        await this.utilityService.presentToast('Las contraseñas no coinciden', 'error-toast');
      }
      
    }else{
      await this.utilityService.presentToast('El formulario no es válido', 'error-toast');
      this.utilityService.closeLoading();
    }
  }
}
