import { Injectable } from '@angular/core';

import { Actions, Effect, ofType, } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of, Subject } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';

import { TicketsActionTypes, TicketsActions, ActionTicketsRetrieve, ActionTicketsSuccess, ActionTicketsError } from '../actions';
import { TicketsService } from '../services';
import { NotificationService } from '@app/core/notifications/notification.service';

@Injectable()
export class TicketsEffects {
    private unsubscribe$: Subject<void> = new Subject<void>();
    constructor(private actions$: Actions<Action>, private service: TicketsService, private notifications: NotificationService) {}

    @Effect()
    searchJiraTicket = () =>
        this.actions$.pipe(
            ofType<TicketsActions>(TicketsActionTypes.RETRIEVE),
            switchMap((action: ActionTicketsRetrieve) => 
                this.service.getTickets(action.payload).pipe(
                    takeUntil(this.unsubscribe$),
                    map((response: any) => {
                        response.data.ticketType = action.payload.ticketType || '';
                        return new ActionTicketsSuccess(response.data);
                    }),
                    catchError(error => {
                        this.notifications.error(error);
                        return of(new ActionTicketsError(error))
                    })
                )
            )
        );

    cancelSearchJiraTicket() {
        this.unsubscribe$.unsubscribe();
    }
     
}