import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from '@env/environment';

@Injectable()
export class JiraService {

    constructor(private httpClient: HttpClient) {}

    /**
     * 
     */
    getTickets({currentJql, fields=''}){
        const params = new HttpParams()
            .append('jql', currentJql)
            .append('fields', fields);

        return this.httpClient.get(`${env.apiUrl}/jira/tickets`, {params});
    }


}