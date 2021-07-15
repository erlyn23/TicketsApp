import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility.service';
import { Plugins } from '@capacitor/core';
import { RepositoryService } from 'src/app/services/repository.service';
import { finalize } from 'rxjs/operators';
import { Ng2ImgMaxService } from 'ng2-img-max';

const { Storage } = Plugins;

@Component({
    selector: 'app-photo-popover',
    templateUrl: './photo-popover.component.html',
    styleUrls: ['./photo-popover.component.scss']
})
export class PhotoPopoverComponent implements OnInit{
    
    isCharging: Boolean = false;
    constructor(private utilityService: UtilityService,
        private angularFireStorage: AngularFireStorage,
        private authService: AuthService,
        private ng2ImgMax: Ng2ImgMaxService,
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
        {
            const resize$ = this.ng2ImgMax.resizeImage(image, 300, 300).subscribe(result => {
                    this.savePhotoInDb(result, filePath, isBusiness); 
                    resize$.unsubscribe();
                },
                error => {
                    console.log('Oh no!', error);
                }
            );
        },
        ()=>{ 
            this.utilityService.closeAlert(); 
        })
    }


    percentage: number = 0;
    async savePhotoInDb(image, filePath, isBusiness){
        this.isCharging = true;
        const fileRef = this.angularFireStorage.ref(filePath);
        const uploadTask = this.angularFireStorage.upload(filePath, image);

        uploadTask.snapshotChanges().pipe(finalize(()=>{
            const uid = this.authService.userData.uid;
            const uploadedPhoto$ = fileRef.getDownloadURL().subscribe(result=>{
                this.repositoryService.updateElement(`users/${uid}`,{photo: result}).then(()=>{
                    if(isBusiness === 'true') this.repositoryService.updateElement(`businessList/${uid}`, {businessPhoto: result});
                    this.utilityService.presentToast('Imagen subida correctamente', 'success-toast');
                    this.utilityService.closePopover();
                    this.percentage = 0;
                    uploadedPhoto$.unsubscribe();
                }).catch(err=>{
                    console.log(err);
                    this.percentage = 0;
                    this.utilityService.presentToast('Ha ocurrido un error al subir la foto', 'error-toast');
                    this.utilityService.closePopover();
                });
            });
        })).subscribe();

        uploadTask.percentageChanges().subscribe(percentage=>{
            this.percentage = Math.round(percentage ? percentage : 0) / 100;
            if(this.percentage === 100) this.isCharging = false;
        });
    }
}