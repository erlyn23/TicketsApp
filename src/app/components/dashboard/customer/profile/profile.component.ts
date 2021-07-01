import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChangePasswordComponent } from 'src/app/components/core/change-password/change-password.component';
import { PhotoPopoverComponent } from 'src/app/components/core/photo-popover/photo-popover.component';
import { ITurn } from 'src/app/core/models/turn.interface';
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

  user: IUser;
  isEdit: boolean = false;

  userUid: string = this.authService.userData.uid;

  constructor(private utilityService: UtilityService,
    private formBuilder: FormBuilder,
    private repositoryService: RepositoryService<IUser>,
    private angularFireDatabase: AngularFireDatabase,
    private authService: AuthService) { }

  ngOnInit() {
    this.updateProfileForm = this.formBuilder.group({
      fullName: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
    });
    this.getUserData(); 
  }

  user$: Subscription;
  getUserData(){
    const userObject: AngularFireObject<IUser> = this.repositoryService.getAllElements(`users/${this.userUid}`);
    this.user$ = userObject.valueChanges().subscribe(result=>{
      this.updateProfileForm.controls.fullName.setValue(result.fullName);
      this.userPhoto = result.photo;
      this.user = result;
    });
  }

  isValidField(field: string): string{
    const validField = this.updateProfileForm.get(field);

    return (!validField.valid && validField.touched) ? 'invalid-field': validField.touched ? 'valid-field' : '';
  }

  async updateProfile(){
    if(this.updateProfileForm.valid){
      await this.repositoryService.updateElement(`users/${this.userUid}`, {
        fullName: this.updateProfileForm.value.fullName
      }).then(async ()=>{

        if(this.user.isInTurn){
          this.updateTurnNameInList();
        }
        await this.utilityService.presentToast('Usuario modificado correctamente', 'success-toast');
        this.isEdit = false;
      });
    }else{
      await this.utilityService.presentToast('Debes llenar los datos', 'error-toast');
    }
  }

  updateTurnNameInList(){
    const turnsObject: AngularFireObject<any> = this.angularFireDatabase.object('clientsInTurn');
    const turn$ = turnsObject.snapshotChanges().subscribe(result=>{
      const turnList = result.payload.val();

      for(let businessKey in turnList){
        for(let turnKey in turnList[businessKey]){
          if(turnList[businessKey][turnKey].clientKey === this.userUid){
            this.repositoryService.updateElement(`clientsInTurn/${businessKey}/${turnKey}`,{
              clientName: this.updateProfileForm.value.fullName
            });
            turn$.unsubscribe();
            break;
          }
        }
      }
    });
  }

  openMyTurn(){
    const turnsObject: AngularFireObject<ITurn> = this.angularFireDatabase.object(`clientsInTurn`);
    const turn$ = turnsObject.snapshotChanges().subscribe(async result=>{
      if(result !== null){
        const turns = result.payload.val();
      
        let turnFounded = 0;

        for(let businessKey in turns){
          for(let turnKey in turns[businessKey]){
            if(turns[businessKey][turnKey].clientKey === this.userUid){
              let myTurn: ITurn = turns[businessKey][turnKey];
              await this.utilityService.presentSimpleAlert(`${myTurn.businessName}`, 
              `<div>Empleado: ${myTurn.employeeName}</div> 
              <div>Número de turno: ${myTurn.turnNum}</div>`);
              turnFounded = 1;
              turn$.unsubscribe();
              break;
            }
          }
        }

        if(turnFounded === 0) await this.utilityService.presentToast('No tienes turno reservado', 'error-toast');
      }
    });
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
