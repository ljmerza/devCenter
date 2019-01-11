import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ActionLinksRetrieve, ActionLinksSuccess, ActionLinksError, NavBarLinksActionTypes } from '../actions';
import { NavBarLinksService } from '../services';
import { NotificationService } from '@app/core/notifications/notification.service';

@Injectable()
export class NavBarLinksEffects {
    constructor(private actions$: Actions<Action>, private service: NavBarLinksService, private notifications: NotificationService) {}

    @Effect()
    retrieveLinks = () =>
        this.actions$.pipe(
            ofType<ActionLinksRetrieve>(NavBarLinksActionTypes.LINKS),
            switchMap(() => 
                this.service.getLinks().pipe(
                    map((response: any) => new ActionLinksSuccess(response.data)),
                    catchError(error => {
                        this.notifications.error(error);
                        return of(new ActionLinksError(error))
                    })
                )
            )
        );
}
