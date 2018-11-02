import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment as env } from '@env/environment';
import { NavBarItem } from './nav-bar.model';

@Injectable()
export class NavBarService {
  constructor(private httpClient: HttpClient) {}

  retrieveNavBar(): Observable<NavBarItem> {
    return this.httpClient.get(`${env.apiUrl}/skipcreds/navbar`);
  }
}
