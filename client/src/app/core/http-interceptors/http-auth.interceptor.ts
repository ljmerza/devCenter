import { Injectable, Injector, ErrorHandler } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpHeaders, HttpRequest, HttpErrorResponse } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';

import {
  ActionSettingsChangeTheme,
  ActionSettingsPersist,
  ActionSettingsEncryptPassword
} from '@app/settings/settings.actions';
import { SettingsState } from '@app/settings/settings.model';
import { selectSettings } from '@app/settings/settings.selectors';
@Injectable()
export class HttpAuthenticationInterceptor implements HttpInterceptor {
  private unsubscribe$: Subject<void> = new Subject<void>();
  settings: SettingsState;

  constructor(private injector: Injector, private store: Store<{}>) {
    store.pipe(select(selectSettings), takeUntil(this.unsubscribe$)).subscribe(settings => this.settings = settings);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headers = new HttpHeaders()
      .set('X-token',  `${this.settings.username}:${this.settings.password}` )
      .set('Content-Type', 'application/json');

    const clonedRequest = request.clone({headers});
    return next.handle(clonedRequest);
  }
}
