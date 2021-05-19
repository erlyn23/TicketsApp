import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility.service';
import { Plugins } from '@capacitor/core';
import { RepositoryService } from 'src/app/services/repository.service';

const { Storage } = Plugins;

@Component({
    selector: 'app-photo-popover',
    templateUrl: './photo-popover.component.html',
    styleUrls: ['./photo-popover.component.scss']
})
export class PhotoPopoverComponent implements OnInit{
    
    constructor(private utilityService: UtilityService,
        private angularFireStorage: AngularFireStorage,
        private authService: AuthService,
        private repositoryService: RepositoryService<string>){ }

    ngOnInit():void{
    
    }

    async uploadImage(ev){
        const isBusiness = (await Storage.get({key: 'role'})).value;
        await this.uploadBusinessImage(ev.target.files[0], Boolean(isBusiness));
    }

    async uploadBusinessImage(image, isBusiness: boolean){
        let filePath = '';
        const uid = this.authService.userData.uid;

        (isBusiness) ? filePath = `business/business-${uid}` : filePath = `clients/client-${uid}`;
        
        this.utilityService.presentAlertWithActions('Confirmar', '¿Estás seguro de querer subir esta foto?',
        async ()=>
        {   await this.utilityService.presentLoading(); 
            this.savePhotoInDb(image, filePath); 
        },
        ()=>{ 
            this.utilityService.closeAlert(); 
        })
    }

    async savePhotoInDb(image, filePath){
        const fileRef = this.angularFireStorage.ref(filePath);
        const uploadTask = this.angularFireStorage.upload(filePath, image);
        const uploadPhoto$ = uploadTask.percentageChanges().subscribe(percent=>{
            if(percent === 100){
                const uid = this.authService.userData.uid;
                this.repositoryService.updateElement(`users/${uid}`,{photo: filePath}).then(()=>{
                    this.repositoryService.updateElement(`businessList/${uid}`, {businessPhoto: filePath}).then(()=>{
                        this.utilityService.presentToast('Imagen subida correctamente', 'success-toast');
                        this.utilityService.closeLoading();
                        this.utilityService.closePopover();
                    });
                });
                uploadPhoto$.unsubscribe();
            }
        });
    }
}