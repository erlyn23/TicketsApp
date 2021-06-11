import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUser } from 'src/app/core/models/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility.service';
import * as MapBox from 'mapbox-gl';
import * as MapBoxGeoCoder from '@mapbox/mapbox-gl-geocoder';
import { environment } from 'src/environments/environment';
import { Geolocation, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';

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
    private geolocation: Geolocation,
    private router: Router) { 
      const user = this.authService.userData;
      if(user){
        this.router.navigate(['/dashboard'])
      }
    }

  async ngOnInit() {
    this.initForm();
    await this.utilityService.presentToast("Enciende la ubicación y reinicia la app para acceder al mapa", 'success-toast');
    let position = await this.geolocation.getCurrentPosition();
    this.initMap(position);
  }

  private initForm():void{
    this.registerForm = this.formBuilder.group({
      fullName: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ["", [Validators.required, Validators.pattern(this.emailPattern)]],
      businessName: ["", [Validators.required]],
      longitude: ["", [Validators.required]],
      latitude: ["", [Validators.required]],
      password: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(this.passwordPattern)]],
      confirmPassword: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(this.passwordPattern)]]
    });
  }

  async initMap(coordinates:Geoposition){
    await this.utilityService.presentLoading();
    MapBox.accessToken = environment.mapToken;
    const map = new MapBox.Map({
      container: 'mapbox-container',
      style: 'mapbox://styles/mapbox/streets-v11', 
      center: [coordinates.coords.longitude, coordinates.coords.latitude], 
      zoom: 15,
    });
    map.on('load', ()=>{
      this.utilityService.closeLoading();
      const marker = new MapBox.Marker().setLngLat([coordinates.coords.longitude, coordinates.coords.latitude]).addTo(map);
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
        latitude: this.registerForm.value.latitude,
        long: this.registerForm.value.longitude,
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
