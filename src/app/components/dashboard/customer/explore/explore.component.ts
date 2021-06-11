import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { NavigationExtras, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { IBusiness } from 'src/app/core/models/business.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';
import * as mapBox from 'mapbox-gl';
import { Geolocation, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { environment } from 'src/environments/environment';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
})
export class ExploreComponent implements OnInit {

  userUid: string;
  businessList: IBusiness[] = [];
  objectRef: AngularFireObject<IBusiness[]>;

  businessSubscription: Subscription[] = [];

  navExtras: NavigationExtras = { state: { business: null, clientsInTurn: 0 } };
  searchBusiness: IBusiness[] = [];
  isSearch: boolean = false;

  constructor(private repositoryService: RepositoryService<IBusiness[]>,
    private utilityService: UtilityService,
    private authService: AuthService,
    private angularFireDatabase: AngularFireDatabase,
    private geolocation: Geolocation,
    private router: Router) {
  }

  ngOnInit() {
    
  }
  
  ionViewWillEnter() {
    this.userUid = this.authService.userData.uid;

    let currentLocation = this.geolocation.getCurrentPosition();
    currentLocation.then((location: Geoposition)=>{
      this.initMap(location.coords.latitude, location.coords.longitude)
    });
  }

  marker: mapBox.Marker;
  map: mapBox.Map;
  watch: Observable<Geoposition | PositionError>;
  initMap(initLat: number, initLng: number){
    this.utilityService.presentLoading().then(()=>{
      mapBox.accessToken = environment.mapToken;
      
      this.map = new mapBox.Map({
        container: 'clientsMap',
        style: 'mapbox://styles/mapbox/streets-v11', 
        center: [initLng, initLat], 
        zoom: 15,
        interactive: false
      });

      this.map.on('load', ()=>{
        this.utilityService.closeLoading();
        this.getBusinessList();
        this.marker = new mapBox.Marker({color:'red'}).setLngLat([initLng, initLat]).addTo(this.map);
        this.map.addControl(new mapBox.NavigationControl());

        this.watch = this.geolocation.watchPosition();
        const locationPosition$ = this.watch.subscribe((location: Geoposition)=>{
          this.listenMap(location.coords.latitude, location.coords.longitude);
        });
        this.businessSubscription.push(locationPosition$);
      });
    })
  }

  listenMap(lat: number, long: number){
    this.map.flyTo({
      center: [long, lat],
      speed: 3
    });
    this.marker.setLngLat([long, lat]);
  }

  getBusinessList(){
    this.objectRef = this.repositoryService.getAllElements(`businessList`);
    const businessList$ = this.objectRef.snapshotChanges().subscribe(result=>{
      const businessList = result.payload.val();
      this.businessList = [];
      for(let businessKey in businessList){
        businessList[businessKey].key = businessKey;
        this.businessList.push(businessList[businessKey]);
        this.createMarkersInMap(businessList[businessKey]);
      }
    });
    this.businessSubscription.push(businessList$);
  }

  createMarkersInMap(business: IBusiness){
    const marker = new mapBox.Marker().setLngLat([business.long, business.latitude])
    .setPopup(new mapBox.Popup()
    .setHTML(`<ion-title style='color: black'>${business.businessName}</ion-title>
    <ion-button fill='clear' style='color: var(--ion-color-primary)' id='businessPopUp-${business.key}'>Ver detalles</ion-button>`))
    .addTo(this.map); 

    this.onDetailsMarkerClick(business);
  }

  onDetailsMarkerClick(business: IBusiness){
    const searchLabel = setInterval(()=>{
      let labelPopUp = document.getElementById(`businessPopUp-${business.key}`);
      if(labelPopUp !== null){
        labelPopUp.addEventListener('click', ()=>{
          this.goToBusinessDetails(business);
        });
        clearInterval(searchLabel);
      }
    }, 3000);
  }

  updateClientsInTurn(businessKey: string, clientsInTurn: number){
    this.repositoryService.updateElement(`businessList/${businessKey}`,{
      clientsInTurn: clientsInTurn,
    });
  }

  searchFilter: string = "";
  searchForBusiness(ev, businessList: IBusiness[]){
    let searchFilter:string = ev.target.value;
    if(searchFilter.length > 0){
      
      this.searchBusiness = [];
      for(let business of businessList){
        if(business.businessName.toLowerCase().includes(searchFilter.toLowerCase())){
          this.searchBusiness.push(business);
        }
      }
    }
    else{
      this.searchBusiness = [];
    }
  }

  searchFromExistingFavourite(businessKey: string){
    const favourite: AngularFireObject<any> = this.angularFireDatabase.object(`favourites/${this.userUid}/${businessKey}`);
    const favouriteBusiness$ = favourite.valueChanges().subscribe(async result=>{
      if(result){
        await this.utilityService.presentToast('Este negocio ya está en tus favoritos', 'error-toast');
        favouriteBusiness$.unsubscribe();
      }else{
        this.addBusinessToFavouriteList(businessKey);
        favouriteBusiness$.unsubscribe();
      }
    });
  }

  async addBusinessToFavouriteList(businessKey: string){
    await this.repositoryService.setElement(`favourites/${this.userUid}/${businessKey}`, {businessKey: businessKey}).then(async ()=>{
      await this.utilityService.presentToast('Negocio añadido a favoritos', 'success-toast');
    }).catch(async err=>{
      console.log(err);
      await this.utilityService.presentToast('Ha ocurrido un error al añadir a favoritos', 'error-toast');
    });
  }

  goToBusinessDetails(business: IBusiness){
    this.navExtras.state.business = business;
    this.router.navigate(['/business-details'], this.navExtras);
  }

  toggleSearch(){
    if(!this.isSearch) this.isSearch = true;
    else {
      this.isSearch = false;
      this.searchFilter = "";
      this.searchBusiness = [];
    }
  }

  ionViewWillLeave() {
    this.businessSubscription.forEach(subscription=>{
      subscription.unsubscribe();
    });
  }

}
