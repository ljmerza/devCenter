import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ActionProfile, ActionProfileSuccess, ActionProfileError, NavBarProfileActionTypes } from '../actions';
import { NavBarProfileService } from '../services';

@Injectable()
export class NavBarProfileEffects {
    constructor(private actions$: Actions<Action>, private service: NavBarProfileService) { }

    @Effect()
    getProfile = () =>
        this.actions$.pipe(
            ofType<ActionProfile>(NavBarProfileActionTypes.PROFILE),
            switchMap(() => {
                return this.service.getProfile().pipe(
                    map((response: any) => new ActionProfileSuccess(response.data)),
                    catchError(error => of(new ActionProfileError(error)))
                )
            })
        ); 
}
