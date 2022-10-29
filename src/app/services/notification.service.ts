import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { environment } from 'src/environments/environment';
import { IBusiness } from '../core/models/business.interface';
import { INotificationBody } from '../core/models/notification-body.interface';
import { AuthService } from './auth.service';
import { RepositoryService } from './repository.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private angularFireMessaging: AngularFireMessaging, 
    private repositoryService: RepositoryService<IBusiness>,
    private utilityService: UtilityService,
    private httpClient: HttpClient) { 


  }

  requestNotification(businessKey: string){
    
    this.angularFireMessaging.requestToken.subscribe(token => {
      this.repositoryService.updateElement(`businessList/${businessKey}`, {
        notificationToken: token
      }).catch(error => {
        console.log(error);
      });


      this.angularFireMessaging.messages.subscribe(payload => {
        console.log(payload);
      });
    });
  }

  sendNotification(notification: INotificationBody) { 
      this.httpClient.post(environment.sendNotification, {
        message: notification
      }, 
        { headers: new HttpHeaders({'content-type': 'application/json'}) 
      }).subscribe(data => {
        
      });
  }
}
