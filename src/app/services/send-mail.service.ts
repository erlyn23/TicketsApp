import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SendMailResponse } from '../core/models/send-mail-response';

@Injectable({
    providedIn: 'root'
})
export class SendMailService {
    constructor(private http: HttpClient){

    }

    sendMail(data: any): Observable<SendMailResponse>{
        return this.http.post<SendMailResponse>(environment.sendMail, data, {headers: new HttpHeaders({"content-type": "application/json"})})
    }
}