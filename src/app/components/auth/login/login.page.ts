import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IAuth } from 'src/app/core/models/auth.interface';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;
  constructor(private formBuilder: FormBuilder,
    private utilityService: UtilityService, 
    private authService: AuthService,
    private router: Router) {
      const user: IAuth = this.authService.userData;

      if(user){
        this.authService.signIn(user);
      }

    }

  ngOnInit() {
    this.initForm();
  }

  private initForm():void{
    this.loginForm = this.formBuilder.group({
      email: [""],
      password: [""]
    });
  }

  async signIn(){
    
    await this.utilityService.presentLoading();
    const user: IAuth = { email: this.loginForm.value.email, password: this.loginForm.value.password };
    
    await this.authService.signIn(user).then(result=>{
      
      this.loginForm.reset();
      this.utilityService.closeLoading();
    
    }).catch(error=>{
      
      this.utilityService.closeLoading();
    });
  }

  goToPage(page: string){
    this.router.navigate([page]);
  }
}
