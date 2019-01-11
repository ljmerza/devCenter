import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { NavBarStatusActionTypes, ActionStatusRetrieve, ActionStatusSuccess, ActionStatusError } from '../actions';
import { NavBarStatusService } from '../services';
import { NotificationService } from '@app/core/notifications/notification.service';

@Injectable()
export class NavBarStatusEffects {
    constructor(private actions$: Actions<Action>, private service: NavBarStatusService, private notifications: NotificationService) { }

    @Effect()
    getStatuses = () =>
        this.actions$.pipe(
            ofType<ActionStatusRetrieve>(NavBarStatusActionTypes.STATUS),
            switchMap(() => {
                return this.service.getStatuses().pipe(
                    map((response: any) => new ActionStatusSuccess(response.data)),
                    catchError(error => {
                        this.notifications.error(error);
                        return of(new ActionStatusError(error))
                    })
                )
            })
        );
}
