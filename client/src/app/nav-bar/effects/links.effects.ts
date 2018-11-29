import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { processJqlLinks } from'./jql.tool';

import { ActionLinksRetrieve, ActionLinksSuccess, ActionLinksError, NavBarLinksActionTypes } from '../actions';
import { NavBarLinksService } from '../services';

@Injectable()
export class NavBarLinksEffects {
    constructor(private actions$: Actions<Action>, private service: NavBarLinksService) {}

    @Effect()
    retrieveLinks = () =>
        this.actions$.pipe(
            ofType<ActionLinksRetrieve>(NavBarLinksActionTypes.LINKS),
            switchMap(() => 
                this.service.getLinks().pipe(
                    map((response: any) => new ActionLinksSuccess(processJqlLinks(response.data))),
                    catchError(error => of(new ActionLinksError(error)))
                )
            )
        );
}
