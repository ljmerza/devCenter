import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { NotificationService } from '@app/core/notifications/notification.service';


import {
    StatusActionTypes, StatusActions,
    ActionStatusSave, ActionStatusSaveSuccess, ActionStatusSaveError,
    ActionCommentSaveSucess, ActionCommentSaveError
} from '../actions';


import { StatusService } from '../services';

@Injectable()
export class StatusEffects {
    constructor(private actions$: Actions<Action>, private service: StatusService, private notifications: NotificationService) { }

    @Effect()
    updateStatus = () =>
        this.actions$.pipe(
            ofType<StatusActions>(StatusActionTypes.SAVE),
            switchMap((action: ActionStatusSave) => {
                this.notifications.info(`Saving new status for ${action.payload.key}`);

                return this.service.updateStatus(action.payload).pipe(
                    map(response => this.processUpdateStatus(response, action)),
                    catchError(error => of(new ActionStatusSaveError(error)))
                )
            })
        );

    /**
     * 
     * @param response 
     * @param action 
     */
    processUpdateStatus(response, action){
        let successMessage = '';

        if (response.data.add_reviewer) {
            const success = this.addReviewer(response.data);
            successMessage += success;
        }

        if (response.data.add_comment) {
            const success = this.addPullComment(response.data);
            successMessage += success;
        }

        if (response.data.pass_response) {
            const success = this.passResponse(response.data);
            successMessage += success;
        }

        // open each pull request
        if (response.data.set_pcr_working) {
            action.payload.pullRequests.forEach(pullRequest => {
                window.open(pullRequest.link);
            });
        }
        
        if (response.data.comment_response){
            const success = this.commentResponse(response.data);
            successMessage += success;
        }

        // finally get the status change result and return action triggered based on that
        const { success, actionDispatched } = this.newStatus(response);
        successMessage += success;

        console.log({successMessage});
        if (successMessage) this.notifications.success(successMessage);
        return actionDispatched;
        
    }

    /**
     * process adding as reviewer to each pull request
     * @param response 
     */
    addReviewer(response){
        let success = ''
        let error='';

        response.add_reviewer.forEach(pullRequest => {
            if (pullRequest.status){
                success += `&#09;${pullRequest.data.repo_name}<br>`;
            } else {
                error += `&#09;${pullRequest.data.repo_name}<br>`;
            }
        });

        if (success) success = `Added you as a reviewer to pull requests:<br>${success}<br><br>`;

        if (error) {
            error = `Failed to added as reviewer to pull requests:<br>${error}`;
            this.notifications.error(error);
        }

        return success;
    }

    /**
     * 
     * @param response 
     */
    newStatus(response) {
        let success = '';
        let actionDispatched;

        if(response.status){
            success = `Successfully updated ${response.data.key} status to ${response.data.new_status.status}`;
            actionDispatched = new ActionStatusSaveSuccess(response.data);

        } else {
            let error = `Failed to update status:<br>${response.data}`;
            this.notifications.error(error);
            actionDispatched = new ActionStatusSaveError(error);
        }

        return { success, actionDispatched};
    }

    /**
     * 
     * @param response 
     */
    addPullComment(response) {
        let success = ''
        let error = '';

        response.add_comment.forEach(comment => {
            if (comment.status) {
                success += `&#09;${comment.data.repo_name}: ${comment.data.text}<br>`;
            } else {
                error += `&#09;${comment.data.repo_name}: ${comment.data.text}<br>`;
            }
        });

        if (success) success = `Added the following pull request comments:<br>${success}<br><br>`;

        if (error) {
            error = `Failed to added the following pull request comments:<br>${error}`;
            this.notifications.error(error);
        }

        return success;
    }

    /**
     * 
     * @param response 
     */
    passResponse(response) {
        let success = ''
        let error = '';

        response.pass_response.forEach(pass => {
            if (pass.status) {
                success += `&#09;${pass.data.repo_name}<br>`;
            } else {
                error += `&#09;${pass.data.repo_name}<br>`;
            }
        });

        if (success) success = `Successfully approved the following pull request repos:<br>${success}<br><br>`;

        if (error) {
            error = `Failed to approve the following pull request repos:<br>${error}`;
            this.notifications.error(error);
        }

        return success;
    }

    /**
     * 
     */
    commentResponse(response){
        if (response.status) {
            new ActionCommentSaveSucess(response.data);
            return `Added comment ${response.data.raw_comment} to ${response.data.key}<br><br>`;

        } else {
            new ActionCommentSaveError(response.data);
            let error = `Failed to add comment ${response.data.raw_comment} to ${response.data.key}`;
            this.notifications.error(error);
            return;
        }
    }
    
}