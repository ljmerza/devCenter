import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { NotificationService } from '@app/core/notifications/notification.service';


import {
    StatusActionTypes, StatusActions,
    ActionStatusSave, ActionStatusSaveSuccess, ActionStatusSaveError,
    ActionCommentSaveSuccess, ActionCommentSaveError
} from '../actions';


import { StatusService } from '../services';

@Injectable()
export class StatusEffects {
    constructor(public store: Store<{}>, private actions$: Actions<Action>, private service: StatusService, private notifications: NotificationService) { }

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

        if (response.data.commit_comment && response.data.commit_ids) {
            const success = this.commitResponse(response.data);
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
            const error = `Failed to update status:<br>${response.data}`;
            this.notifications.error(error);
            actionDispatched = new ActionStatusSaveError(error);
        }

        return { success, actionDispatched };
    }

    /**
     * 
     * @param response 
     */
    commitResponse(data){
        let success = '';

        if (data.commit_ids.status){
            success += `The following commits have been found:<br>`
            data.commit_ids.data.forEach(commit => {
                success += `${commit.repo_name}: ${commit.commit_id}<br>`;
            });

        } else {
            const error = `Failed to add commits to Jira:<br>${data.commit_ids.data}`;
            this.notifications.error(error);
        }

        if (data.commit_comment.status) {
            success += this.commentResponse(data.commit_comment);

        } else {
            const error = `Failed to add commits comment to Jira:<br>${data.commit_comment.data}`;
            this.notifications.error(error);
        }

        return success;
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

        if (success) {
            success = `Added the following pull request comments:<br>${success}<br><br>`;
        }

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
     * @param response 
     */
    commentResponse(response){

        if (response.status) {
            // format for add log reducer
            const addLogResponse = { comment_response: response, key: response.data.key };
            this.store.dispatch(new ActionCommentSaveSuccess(addLogResponse));
            return `Added comment to ${response.data.key}<br><br>`;

        } else {
            this.store.dispatch(new ActionCommentSaveError(response.data));
            let error = `Failed to add comment to ${response.data.key}`;
            this.notifications.error(error);
            return;
        }
    }
    
}