import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from '@env/environment';

@Injectable()
export class TicketsService {

    constructor(private httpClient: HttpClient) {}

    /**
     * gets a list of tickets given a jql and a list of fields for the tickets
     */
    getTickets({currentJql, fields=''}){
        const params = new HttpParams()
            .append('jql', currentJql)
            .append('fields', fields);

        return this.httpClient.get(`${env.apiUrl}/jira/tickets`, {params});
    }
}