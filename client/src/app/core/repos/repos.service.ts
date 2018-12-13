import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from '@env/environment';

@Injectable()
export class ReposService {
    constructor(private httpClient: HttpClient) { }

    /**
     * 
     */
    getRepos() {
        return this.httpClient.get(`${env.apiUrl}/jira/repos`);
    }
}