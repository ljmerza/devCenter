import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from '@env/environment';

@Injectable()
export class StatusService {
    constructor(private httpClient: HttpClient) {}

    /**
     * 
     */
    updateStatus(key){
        const params = new HttpParams().append('jql', encodeURIComponent(`key = ${key}`))
        return this.httpClient.get(`${env.apiUrl}/jira/tickets`, {params});
    }

    /**
     * 
     */
    generateQa(key) {
        const params = new HttpParams().append('jql', encodeURIComponent(`key = ${key}`))
        return this.httpClient.get(`${env.apiUrl}/jira/tickets`, { params });
    }
}