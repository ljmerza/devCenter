import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
    StatusActionTypes, StatusActions,
    ActionStatusQaSave, ActionStatusQaSaveSuccess, ActionStatusQaSaveError, ActionCommentSaveSuccess, ActionStatusSaveSuccess, ActionStatusSaveError
} from '../actions';

import { StatusService } from '../services';
import { NotificationService } from '@app/core/notifications/notification.service';

@Injectable()
export class QaGeneratorEffects {
    constructor(public store: Store<{}>, private actions$: Actions<Action>, private service: StatusService, private notifications: NotificationService) { }
    
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
        console.log({ response, action });
        const key = action.payload.key;
        
        if (!response.status) {
            this.notifications.error(`Error generating QA workflow for ${key}: ${response.data}`);
            return new ActionStatusQaSaveError(response.data);
        }

        let success:string = '';
        
        // check for add comment response
        const addLogResponse = { key, comment_response: false, log_response: false };
        if (response.data.comment_response && response.data.comment_response.status){
            addLogResponse.comment_response = response.data.comment_response;
            success += `Added QA comment<br>`;

        } else if (response.data.comment_response && action.payload.qa_steps){
            this.notifications.error(`Error adding QA steps for ${key}: ${response.data.comment_response.data}`);
        }

        // check for pull response
        if (response.data.pull_response && response.data.pull_response.status) {

            const validPullRequests = [];
            let pullRequestSuccesses = '';

            response.data.pull_response.data.forEach(pullRequest => {
                if(pullRequest.error){
                    this.notifications.error(`Error creating pull request for ${key} for repo ${pullRequest.repo}: ${pullRequest.error}`);
                } else {
                    validPullRequests.push(pullRequest);
                    pullRequestSuccesses += `<a href='${pullRequest.link}' target='_blank'>${pullRequest.repo}</a><br>`;
                }
            });

            if (pullRequestSuccesses){
                response.data.pcr_response.pullRequests = validPullRequests;
                response.data.cr_response.pullRequests = validPullRequests;
                success += `Created pull requests for:<br>${pullRequestSuccesses}<br>`;
            }

        } else if (response.data.pull_response && action.payload.repos.length) {
            this.notifications.error(`Error creating pull requests for ${key}: ${response.data.pull_response.data}`);
        }

        // check for log response
        if (response.data.log_response && response.data.log_response.status) {
            addLogResponse.log_response = response.data.log_response;
            success += `Added time log of ${action.payload.logTime.hour} hours and ${action.payload.logTime.minute} minutes<br>`;

        } else if (response.data.log_response && action.payload.log_time) {
            this.notifications.error(`Error adding time log for ${key}: ${response.data.log_response.data}`);
        }

        // if we have add log or add coment auccess then dispatch to store
        if (addLogResponse.comment_response || addLogResponse.log_response){
            this.store.dispatch(new ActionCommentSaveSuccess(addLogResponse));
        }

        // check for status change response ->
        // if both success, if cr only success, if pcr only success, if both fail
        if (
            response.data.cr_response && response.data.cr_response.status &&
            response.data.pcr_response && response.data.pcr_response.status
        ){
            this.store.dispatch(new ActionStatusSaveSuccess(response.data.pcr_response));
            success += `Transitioned to CR and added PCR Needed component<br>`;

        } else if (
            response.data.cr_response && response.data.cr_response.status &&
            response.data.pcr_response && !response.data.pcr_response.status && action.payload.autoPCR
        ){
            this.store.dispatch(new ActionStatusSaveSuccess(response.data.cr_response));
            this.notifications.error(`Error adding PCR component for ${key}: ${response.data.pcr_response.data}`);
            success += `Transitioned to CR<br>`;
            
        } else if (
            response.data.pcr_response && response.data.pcr_response.status &&
            response.data.cr_response && !response.data.cr_response.status && action.payload.autoPCR
        ) {
            this.store.dispatch(new ActionStatusSaveSuccess(response.data.pcr_response));
            this.notifications.error(`Error transitioning to Code Review status for ${key}: ${response.data.cr_response.data}`);
            success += `Added PCR Needed component<br>`;

        } else if (
            response.data.pcr_response && !response.data.pcr_response.status &&
            response.data.cr_response && !response.data.cr_response.status && action.payload.autoPCR
        ) {
            this.store.dispatch(new ActionStatusSaveError(response.data.pcr_response.data));
            this.notifications.error(`Error changing status for ${key}: ${response.data.pcr_response.data} and ${response.data.cr_response.data}`);
        }

        // check dev changes
        if (response.data.dev_change_response && response.data.dev_change_response){
            success += `Added dev chnages pull requests`;

        } else if (response.data.dev_change_response){
            this.notifications.error(`Error adding dev changes notes for ${key}: ${response.data.dev_change_response.data}`);
        }

        console.log({success});
        if (success) this.notifications.success(`Successfully completed the following actions:<br>${success}`);
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