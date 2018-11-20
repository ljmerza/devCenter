import { Injectable, OnInit } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
    JiraActionTypes, JiraActions,
    ActionTicketsRetrieve, ActionTicketsSuccess, ActionTicketsError, 
} from './jira.actions';

import { JiraService } from './jira.service';

@Injectable()
export class JiraEffects implements OnInit {
    constructor(private actions$: Actions<Action>, private service: JiraService) {}

    @Effect()
    searchJiraTicket = () =>
        this.actions$.pipe(
            ofType<JiraActions>(JiraActionTypes.RETRIEVE),
            switchMap((action: ActionTicketsRetrieve) => 
                this.service.getTickets(action.payload).pipe(
                    map((response: any) => new ActionTicketsSuccess(response.data)),
                    catchError(() => of(new ActionTicketsError()))
                )
            )
        );
}