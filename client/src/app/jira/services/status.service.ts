import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable()
export class StatusService {
    constructor(private httpClient: HttpClient) {}

   /**
    * 
    * @param postData 
    */
    updateStatus(postData): Observable<any> {
        return this.httpClient.post(`${env.apiUrl}/jira/status`, postData);
    }

    /**
     * 
     * @param postData 
     */
    generateQa(postData): Observable<any>  {
        return this.httpClient.post(`${env.apiUrl}/codecloud/create`, postData);
    }
}