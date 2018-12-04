import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { NavBarActionTypes, ActionNavBarRetrieve, ActionNavBarSuccess, ActionNavBarError } from '../actions';
import { NavBarService } from '../services';

@Injectable()
export class NavBarEffects {
    constructor(private actions$: Actions<Action>, private service: NavBarService) { }

    @Effect()
    retrieveNavBar = () =>
        this.actions$.pipe(
            ofType<ActionNavBarRetrieve>(NavBarActionTypes.RETRIEVE),
            switchMap(() => {
                return this.service.retrieveNavBar().pipe(
                    map((response: any) => new ActionNavBarSuccess(response.data)),
                    catchError(error => of(new ActionNavBarError(error)))
                )
            })
        );
}
