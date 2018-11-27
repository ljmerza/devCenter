import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
    additionalDetailsActionTypes, additionalDetailsActions,
    ActionAdditionalDetailsRetrieve, ActionAdditionalDetailsSuccess, ActionAdditionalDetailsError, 
} from '../actions';

import { AdditionalDetailsService } from '../services';

@Injectable()
export class AdditionalDetailsEffects {
    constructor(private actions$: Actions<Action>, private service: AdditionalDetailsService) {}

    @Effect()
    getAdditionalDetails = () =>
        this.actions$.pipe(
            ofType<additionalDetailsActions>(additionalDetailsActionTypes.RETRIEVE),
            switchMap((action: ActionAdditionalDetailsRetrieve) => 
                this.service.getAdditionalDetails(action.payload).pipe(
                    map((response: any) => new ActionAdditionalDetailsSuccess(response.data)),
                    catchError(() => of(new ActionAdditionalDetailsError()))
                )
            )
        );
}