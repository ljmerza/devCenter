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
                    catchError(error => {
                        this.notifications.error(error);
                        return of(new ActionStatusSaveError(error))
                    })
                )
            })
        );

    /**
     * Handles all responses from update status
     * Possible responses (from set_status):
	 *		pr_add_response, status_response, comment_response, new_response
	 *			commit_ids, commit_comment (from add_commits_table_comment)
     * @param response  
     * @param action 
     */
    processUpdateStatus(response, action){
        let successMessage = '';

        if (response.data.pr_add_response) {
            const success = this.addReviewer(response.data.pr_add_response);
            successMessage += success;

            // open PRs in new window
            action.payload.pullRequests.forEach(pullRequest => {
                window.open(pullRequest.link);
            });
        }
        
        if (response.data.pr_pass_response && response.data.pr_pass_response.data) {
            const success = this.prPassResponse(response.data.pr_pass_response);
            successMessage += success;
        }

        if (response.data.commit_ids && response.data.commit_comment) {
            const success = this.commitResponse(response.data.commit_ids, response.data.commit_comment);
            successMessage += success;
        }
        
        if (response.data.comment_response){
            const success = this.commentResponse(response.data.comment_response);
            successMessage += success;
        }

        // finally get the status change result and return action triggered based on that
        const { success, actionDispatched } = this.newStatus(response.status_response, response.new_response);
        successMessage += success;

        if (successMessage) this.notifications.success(successMessage);
        return actionDispatched;
        
    }

    /**
     * 
     * @param response 
     */
    addComment(response){
        let success = ''

        if (response.status){
            success = `Added comment to Jira ticket<br><br>`;

        } else if(response.data){
            this.notifications.error(`Failed to added comment:<br>${response.data}`);
        }

        return success;
    }

    /**
     * process adding as reviewer to each pull request
     * @param response 
     */
    addReviewer(response){
        let success = ''
        let error = '';

        if (response.status){
            response.data.forEach(pullRequest => {
                if (pullRequest.status) {
                    success += `&#09;${pullRequest.data.repo_name}<br>`;
                } else {
                    error += `&#09;${pullRequest.data.repo_name}<br>`;
                }
            });
        } else {
            error = response.data;
        }

        if (success) success = `Added you as a reviewer to pull requests:<br>${success}<br><br>`;

        if (error) {
            this.notifications.error(`Failed to added as reviewer to pull requests:<br>${error}`);
        }

        return success;
    }

    /**
     * 
     * @param response 
     */
    newStatus(status_response, new_response) {
        let success = '';
        let actionDispatched;

        if (status_response.status && new_response.status){
            success = `Successfully updated ${status_response.data.key} status to ${new_response.data.status}`;
            actionDispatched = new ActionStatusSaveSuccess(new_response.data);
        
        } else {
            const error = `Failed to update status:<br>${new_response.data}`;
            this.notifications.error(error);
            actionDispatched = new ActionStatusSaveError(error);
        }

        return { success, actionDispatched };
    }

    /**
     * get commit ids and commit jira comment response
     * @param response 
     */
    commitResponse(commit_ids, commit_comment){
        let success = '';

        if (commit_ids.status){
            success += `The following commits have been found:<br>`
            commit_ids.data.forEach(commit => {
                success += `${commit.repo_name}: ${commit.commit_id}<br>`;
            });

        } else {
            this.notifications.error(`Failed to get commits:<br>${commit_ids.data}`);
        }

        if (commit_comment.status){
            success += `Added commits comment to Jira:<br>`
        } else {
            this.notifications.error(`Failed to add commits comment to Jira:<br>${commit_comment.data}`);
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
     * process pull request pass response
     * @param response 
     */
    prPassResponse(response) {
        let success = ''
        let error = '';

        if (response.status){
            response.data.forEach(pass => {
                if (pass.status) {
                    success += `&#09;${pass.data.repo_name}<br>`;
                } else {
                    error += `&#09;${pass.data.repo_name}<br>`;
                }
            });

            if (success) success = `Successfully approved the following pull request repos:<br>${success}<br><br>`;
        } 
        
        if(error || !response.status){
            error = `Failed to approve the following pull request repos:<br>${response.data} ${error}`;
            this.notifications.error(error);
        }

        return success;
    }

    /**
     * Process an added comment to the Jira ticket.
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