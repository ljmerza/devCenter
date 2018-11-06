import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment as env } from '@env/environment';

@Injectable()
export class NavBarService {
  constructor(private httpClient: HttpClient) {}

  retrieveNavBar(): Observable<any> {
    return this.httpClient.get(`${env.apiUrl}/skipcreds/navbar`);
  }
}
