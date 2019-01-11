import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { environment as env } from '@env/environment';

import { NotificationService } from '@app/core/notifications/notification.service';
import { NavBarSearchActionTypes, ActionOpenTicket, ActionSearch, ActionSearchError } from '../actions';

import { NavBarSearchService } from '../services';

@Injectable()
export class NavBarSearchEffects {
    constructor(private actions$: Actions<Action>, private service: NavBarSearchService, private notifications: NotificationService) { }

    @Effect()
    searchJiraTicket = () =>
        this.actions$.pipe(
            ofType<ActionSearch>(NavBarSearchActionTypes.SEARCH),
            switchMap((action: ActionSearch) => {
                this.notifications.info(`Looking up key for ticket MSRP ${action.payload}`);

                return this.service.findJiraTicket(action.payload).pipe(
                    map((response: any) => new ActionOpenTicket(response.data)),
                    catchError(error => {
                        this.notifications.error(error);
                        return of(new ActionSearchError(error))
                    })
                )
            })
        );

    @Effect({ dispatch: false })
    openTicket = this.actions$.pipe(
        ofType<ActionOpenTicket>(NavBarSearchActionTypes.OPEN_TICKET),
        tap(action => {
            this.notifications.success(`Opening ticket key ${action.payload}`);
            window.open(`${env.jiraUrl}/browse/${action.payload}`);
        })
    );
}
