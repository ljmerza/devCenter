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
import { NotificationService } from '@app/core/notifications/notification.service';

@Injectable()
export class QaGeneratorEffects {
    constructor(private actions$: Actions<Action>, private service: StatusService, private notifications: NotificationService) { }
    
    @Effect()
    generateQa = () =>
        this.actions$.pipe(
            ofType<StatusActions>(StatusActionTypes.SAVE_QA),
            switchMap((action: ActionStatusQaSave) => {
                this.savingNotification(action);

                return this.service.generateQa(action.payload).pipe(
                    map(response => this.processGenerateQa(response, action)),
                    catchError(error => of(new ActionStatusQaSaveError(error)))
                )
            })
        );

    /**
     * 
     * @param response 
     * @param action 
     */
    processGenerateQa(response, action) {
        return new ActionStatusQaSaveSuccess(response.data);
    }

    /**
     * generate info notification for form submission
     * @param action 
     */
    savingNotification(action){
        let message = 'Performing the following actions:<br>';

        if (action.payload.qa_steps) {
            message += `Adding QA steps for ${action.payload.key}<br>`;
        }

        if (action.payload.log_time && action.payload.logTime) {
            message += `Adding time log of ${action.payload.logTime.hour} hours and ${action.payload.logTime.minute} minutes<br>`;
        }

        if (action.payload.repos && action.payload.repos.length) {
            message += `Creating ${action.payload.repos.length} pull requests<br>`;
        }

        this.notifications.info(message);
    }
}