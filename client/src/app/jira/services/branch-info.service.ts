import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from '@env/environment';

@Injectable()
export class BranchInfoService {

    constructor(private httpClient: HttpClient) {}

    /**
     * 
     */
    getAdditionalDetails(key){
        const params = new HttpParams().append('jql', encodeURIComponent(`key = ${key}`))
        return this.httpClient.get(`${env.apiUrl}/jira/tickets`, {params});
    }


}