import { Component, OnInit } from '@angular/core';
import { AngularFireObject } from '@angular/fire/database';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IBusiness } from 'src/app/core/models/business.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { UtilityService } from 'src/app/services/utility.service';
import * as mapBox from 'mapbox-gl';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
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

  businessSubscription: Subscription;

  navExtras: NavigationExtras = { state: { business: null, clientsInTurn: 0 } };
  searchBusiness: IBusiness[] = [];
  isSearch: boolean = false;

  constructor(private repositoryService: RepositoryService<IBusiness[]>,
    private utilityService: UtilityService,
    private authService: AuthService,
    private geolocation: Geolocation,
    private router: Router) {
  }

  ngOnInit() {
    
  }
  
  ionViewWillEnter() {
    this.userUid = this.authService.userData.uid;

    let currentLocation = this.geolocation.getCurrentPosition();
    currentLocation.then(async (location: Geoposition)=>{
      await this.initMap(location.coords.latitude, location.coords.longitude)
    });
  }

  marker: mapBox.Marker;
  map: mapBox.Map;
  async initMap(initLat: number, initLng: number){
    await this.utilityService.presentLoading();
    mapBox.accessToken = environment.mapToken;
      this.map = new mapBox.Map({
      container: 'clientsMap',
      style: 'mapbox://styles/mapbox/streets-v11', 
      center: [initLng, initLat], 
      zoom: 15,
      interactive: false
    });

    this.map.on('load', ()=>{
      this.getBusinessList();
      this.utilityService.closeLoading();
      this.marker = new mapBox.Marker({color:'red'}).setLngLat([initLng, initLat]).addTo(this.map);
      this.map.addControl(new mapBox.NavigationControl());

      let watch = this.geolocation.watchPosition();

      watch.subscribe((location: Geoposition)=>{
        this.listenMap(location.coords.latitude, location.coords.longitude);
      });
    });
  }

  listenMap(lat: number, long: number){
    this.map.setCenter([long, lat]);
    this.marker.setLngLat([long, lat]);
  }

  getBusinessList(){
    this.objectRef = this.repositoryService.getAllElements(`businessList`);
    this.businessSubscription = this.objectRef.snapshotChanges().subscribe(result=>{
      const businessList = result.payload.val();
      this.businessList = [];
      for(let businessKey in businessList){
        businessList[businessKey].key = businessKey;
        this.businessList.push(businessList[businessKey]);
        this.createMarkersInMap(businessList[businessKey]);
      }
    });
  }

  createMarkersInMap(business: IBusiness){
    const marker = new mapBox.Marker().setLngLat([business.long, business.latitude])
    .setPopup(new mapBox.Popup()
    .setHTML(`<ion-title id="businessPopUp-${business.key}">${business.businessName}</ion-title>`))
    .addTo(this.map); 

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

  async addBusinessToFavouriteList(business: IBusiness){
    await this.repositoryService.setElement(`favourites/${this.userUid}/${business.key}`, {businessKey: business.key}).then(async ()=>{
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
    this.businessSubscription.unsubscribe();
  }

}
