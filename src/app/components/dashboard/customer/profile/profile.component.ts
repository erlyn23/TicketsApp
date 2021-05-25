import { Component, OnInit } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChangePasswordComponent } from 'src/app/components/core/change-password/change-password.component';
import { PhotoPopoverComponent } from 'src/app/components/core/photo-popover/photo-popover.component';
import { IUser } from 'src/app/core/models/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

  userPhoto: string = "";
  updateProfileForm: FormGroup;
  constructor(private utilityService: UtilityService,
    private formBuilder: FormBuilder,
    private repositoryService: RepositoryService<IUser>,
    private authService: AuthService) { }

  ngOnInit() {
    this.updateProfileForm = this.formBuilder.group({
      fullName: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
    });
    this.getUserData(); 
  }

  user$: Subscription;
  getUserData(){
    const userObject: AngularFireObject<IUser> = this.repositoryService.getAllElements(`users/${this.authService.userData.uid}`);
    this.user$ = userObject.valueChanges().subscribe(result=>{
      this.updateProfileForm.controls.fullName.setValue(result.fullName);
      this.userPhoto = result.photo;
    });
  }

  isValidField(field: string): string{
    const validField = this.updateProfileForm.get(field);

    return (!validField.valid && validField.touched) ? 'invalid-field': validField.touched ? 'valid-field' : '';
  }

  async updateProfile(){
    if(this.updateProfileForm.valid){
      await this.repositoryService.updateElement(`users/${this.authService.userData.uid}`, {
        fullName: this.updateProfileForm.value.fullName
      }).then(async ()=>{
        await this.utilityService.presentToast('Usuario modificado correctamente', 'success-toast');
      });
    }else{
      await this.utilityService.presentToast('Debes llenar los datos', 'error-toast');
    }
  }

  async openChangePassword(){
    await this.utilityService.openModal(ChangePasswordComponent);
  }

  async openChangePhotoPopover(){
    await this.utilityService.showPopover(PhotoPopoverComponent);
  }

  async logOut(){
    await this.authService.signOut();
  }

  ionViewWillLeave() {
    this.user$.unsubscribe();
  }
}
