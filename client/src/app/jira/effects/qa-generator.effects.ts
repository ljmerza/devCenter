import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
    StatusActionTypes, StatusActions,
    ActionStatusQaSave, ActionStatusQaSaveSuccess, ActionStatusQaSaveError
} from '../actions';

import { StatusService } from '../services';

@Injectable()
export class QaGeneratorEffects {
    constructor(private actions$: Actions<Action>, private service: StatusService) { }
    
    @Effect()
    generateQa = () =>
        this.actions$.pipe(
            ofType<StatusActions>(StatusActionTypes.SAVE_QA),
            switchMap((action: ActionStatusQaSave) =>
                this.service.generateQa(action.payload).pipe(
                    map(response => this.processGenerateQa(response)),
                    catchError(error => of(new ActionStatusQaSaveError(error)))
                )
            )
        );

    /**
     * 
     * @param response 
     */
    processGenerateQa(response) {
        return new ActionStatusQaSaveSuccess(response.data);
    }
}