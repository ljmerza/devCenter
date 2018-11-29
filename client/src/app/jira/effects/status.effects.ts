import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
    StatusActionTypes, StatusActions,
    ActionStatusSave, ActionStatusSaveSucess, ActionStatusSaveError,
    ActionStatusQaSave, ActionStatusQaSaveSucess, ActionStatusQaSaveError
} from '../actions';

import { StatusService } from '../services';

@Injectable()
export class StatusEffects {
    constructor(private actions$: Actions<Action>, private service: StatusService) { }

    @Effect()
    updateStatus = () =>
        this.actions$.pipe(
            ofType<StatusActions>(StatusActionTypes.SAVE),
            switchMap((action: ActionStatusSave) =>
                this.service.updateStatus(action.payload).pipe(
                    map(response => this.processUpdateStatus(response)),
                    catchError(error => of(new ActionStatusSaveError(error)))
                )
            )
        );
    
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
    processUpdateStatus(response){
        return new ActionStatusSaveSucess(response.data);
    }

    /**
     * 
     * @param response 
     */
    processGenerateQa(response) {
        return new ActionStatusQaSaveSucess(response.data);
    }
}