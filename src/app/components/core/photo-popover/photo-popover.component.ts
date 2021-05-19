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
        await this.uploadBusinessImage(ev.target.files[0], isBusiness);
    }

    async uploadBusinessImage(image, isBusiness: string){
        let filePath = '';
        const uid = this.authService.userData.uid;

        if(isBusiness === 'true') filePath = `business/business-${uid}`;
        else filePath = `clients/client-${uid}`;

        this.utilityService.presentAlertWithActions('Confirmar', '¿Estás seguro de querer subir esta foto?',
        async ()=>
        {   await this.utilityService.presentLoading(); 
            this.savePhotoInDb(image, filePath, isBusiness); 
        },
        ()=>{ 
            this.utilityService.closeAlert(); 
        })
    }

    async savePhotoInDb(image, filePath, isBusiness){
        const fileRef = this.angularFireStorage.ref(filePath);
        const uploadTask = this.angularFireStorage.upload(filePath, image);
        const uploadPhoto$ = uploadTask.percentageChanges().subscribe(percent=>{
            if(percent === 100){
                const uid = this.authService.userData.uid;
                const uploadedPhoto$ = fileRef.getDownloadURL().subscribe(result=>{
                    this.repositoryService.updateElement(`users/${uid}`,{photo: result}).then(()=>{
                        if(isBusiness === 'true') this.repositoryService.updateElement(`businessList/${uid}`, {businessPhoto: result});
                        this.utilityService.presentToast('Imagen subida correctamente', 'success-toast');
                        this.utilityService.closeLoading();
                        this.utilityService.closePopover();
                        uploadedPhoto$.unsubscribe();
                    }).catch(err=>{
                        console.log(err);
                        this.utilityService.presentToast('Ha ocurrido un error al subir la foto', 'error-toast');
                        this.utilityService.closeLoading();
                        this.utilityService.closePopover();
                    });
                });
                uploadPhoto$.unsubscribe();
            }
        });
    }
}