import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { TicketsActionTypes, TicketsActions, ActionTicketsRetrieve, ActionTicketsSuccess, ActionTicketsError } from '../actions';
import { TicketsService } from '../services';

@Injectable()
export class TicketsEffects {
    constructor(private actions$: Actions<Action>, private service: TicketsService) {}

    @Effect()
    searchJiraTicket = () =>
        this.actions$.pipe(
            ofType<TicketsActions>(TicketsActionTypes.RETRIEVE),
            switchMap((action: ActionTicketsRetrieve) => 
                this.service.getTickets(action.payload).pipe(
                    map((response: any) => new ActionTicketsSuccess(response.data)),
                    catchError(() => of(new ActionTicketsError()))
                )
            )
        );
}