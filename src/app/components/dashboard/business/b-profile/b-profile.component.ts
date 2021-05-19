import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUser } from 'src/app/core/models/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility.service';
import * as MapBox from 'mapbox-gl';
import * as MapBoxGeoCoder from '@mapbox/mapbox-gl-geocoder';
import { environment } from 'src/environments/environment';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { RepositoryService } from 'src/app/services/repository.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { PhotoPopoverComponent } from 'src/app/components/core/photo-popover/photo-popover.component';
import { AngularFireStorage } from '@angular/fire/storage';
import { ChangePasswordComponent } from 'src/app/components/core/change-password/change-password.component';

@Component({
  selector: 'app-b-profile',
  templateUrl: './b-profile.component.html',
  styleUrls: ['./b-profile.component.scss'],
})
export class BProfileComponent implements OnInit {

  registerForm: FormGroup;
  businessPhoto: string = "";
  constructor(private formBuilder: FormBuilder,
    private repositoryService: RepositoryService<IUser>,
    private authService: AuthService,
    private utilityService: UtilityService,
    private angularFireDatabase: AngularFireDatabase,
    private router: Router) { 
      const user = this.authService.userData;
      if(user){
        this.router.navigate(['/dashboard'])
      }
    }

  ngOnInit() {
    this.initForm();
    this.getBusinessData();
  }

  business$: Subscription;
  getBusinessData(){
    const businessObject: AngularFireObject<IUser> = this.angularFireDatabase.object(`users/${this.authService.userData.uid}`);
    this.business$ = businessObject.valueChanges().subscribe(result=>{
      this.registerForm.controls.fullName.setValue(result.fullName);
      this.registerForm.controls.businessName.setValue(result.businessName);
      this.registerForm.controls.longitude.setValue(result.long);
      this.registerForm.controls.latitude.setValue(result.latitude); 
      
      if(result.photo != undefined) {
        this.businessPhoto = result.photo;
      }

      this.initMap(result.long, result.latitude);
    });
  }

  private initForm():void{
    this.registerForm = this.formBuilder.group({
      fullName: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      businessName: ["", [Validators.required]],
      longitude: ["", [Validators.required]],
      latitude: ["", [Validators.required]]
    });
  }

  initMap(initLong: number, initLat:number):void{
    MapBox.accessToken = environment.mapToken;
    const map = new MapBox.Map({
      container: 'mapbox-container',
      style: 'mapbox://styles/mapbox/streets-v11', 
      center: [initLong, initLat], 
      zoom: 9,
    });
    const marker = new MapBox.Marker().setLngLat([initLong, initLat]).addTo(map);

    this.registerForm.get('longitude').setValue(marker._lngLat.lng);
    this.registerForm.get('latitude').setValue(marker._lngLat.lat);

    const geocoder = new MapBoxGeoCoder({
      accessToken: environment.mapToken,
      mapboxgl: MapBox,
      placeholder: 'Dirección del negocio',
      marker: false
    });
    map.addControl(geocoder);

    map.addControl(new MapBox.NavigationControl());
    map.on('click', (e)=>{
      const currentLng = e.lngLat.lng;
      const currentLat = e.lngLat.lat;
      marker.setLngLat([currentLng, currentLat]);

      this.registerForm.get('longitude').setValue(currentLng);
      this.registerForm.get('latitude').setValue(currentLat);
    });
  }

  isValidField(field: string): string{
    const validField: AbstractControl = this.registerForm.get(field);

    return (!validField.valid && validField.touched) ? 'invalid-field' : validField.touched ? 'valid-field' : '';
  }

  async openChangePhotoPopover(){
    await this.utilityService.showPopover(PhotoPopoverComponent);
  }

  async registerUser(){
    await this.utilityService.presentLoading();
    if(this.registerForm.valid){
      
      const user: IUser = { fullName: this.registerForm.value.fullName,
      email: this.authService.userData.email,
      password: '',
      businessName: this.registerForm.value.businessName,
      latitude: this.registerForm.value.latitude,
      long: this.registerForm.value.longitude,
      isBusiness: true };
      
      await this.repositoryService.updateElement(`users/${this.authService.userData.uid}`,user).then(async ()=>{
        await this.repositoryService.updateElement(`businessList/${this.authService.userData.uid}`, {
          latitude: user.latitude,
          long: user.long,
          businessName: user.businessName
        }).then(async ()=>{
          this.utilityService.closeLoading();
          await this.utilityService.presentToast('Usuario modificado correctamente', 'success-toast');
        });
      }).catch(async error=>{
        console.log(error);
        await this.utilityService.presentToast('Ha ocurrido un error al modificar usuario', 'error-toast');
        this.utilityService.closeLoading();
      
      });
    }else{
      await this.utilityService.presentToast('El formulario no es válido', 'error-toast');
      this.utilityService.closeLoading();
    }
  }

  async openChangePassword(){
    await this.utilityService.openModal(ChangePasswordComponent);
  }

  async logOut(){
    await this.authService.signOut();
  }

  ngOnDestroy(): void {
    this.business$.unsubscribe();
  }

}
