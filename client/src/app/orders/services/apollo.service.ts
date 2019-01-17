import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable()
export class ApolloService {
    cachedApolloOrders;

    constructor(private httpClient: HttpClient) {}

    /**
     * gets a list a apollo orders from the cron
     */
    getApolloOrders(): Observable<any> {
        return this.httpClient.get(`${env.apiUrl}/skipcreds/json_api/orders`)
    }
}