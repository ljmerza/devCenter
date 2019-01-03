import {Injectable} from '@angular/core';

import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';

import {
	ActionCommentSave,
	ActionCommentSaveSuccess,
	ActionCommentSaveError,
	ActionCommentEdit,
	ActionCommentEditSuccess,
	ActionCommentEditError,
	ActionCommentDelete,
	ActionCommentDeleteSuccess,
	ActionCommentDeleteError,
	CommentActions,
	CommentActionTypes,
	ActionStatusSaveSuccess,
} from '../actions';

import {CommentsService} from '../services';
import {NotificationService} from '@app/core/notifications/notification.service';

@Injectable()
export class CommentEffects {
	constructor(public store: Store<{}>, private actions$: Actions<Action>, private service: CommentsService, private notifications: NotificationService) {}

	@Effect({dispatch: false})
	addComment = () =>
		this.actions$.pipe(
			ofType<CommentActions>(CommentActionTypes.SAVE),
			switchMap((action: ActionCommentSave) => {
				this.savingNotification(action);

				return this.service.addComment(action.payload).pipe(
					map(response => {
						this.processSaveLog(response.data, action);
					}),
					catchError(response => of(new ActionCommentSaveError(response.data)))
				);
			})
		);

	@Effect()
	editComment = () =>
		this.actions$.pipe(
			ofType<CommentActions>(CommentActionTypes.EDIT),
			switchMap((action: ActionCommentEdit) => {
				this.notifications.info(`Saving edited comment ${action.payload.commentId} for ${action.payload.key}`);

				return this.service.editComment(action.payload).pipe(
					map((response: any) => {
						this.notifications.success(`Successfully edited comment ${action.payload.commentId} for ${action.payload.key}`);
						return new ActionCommentEditSuccess(response.data);
					}),
					catchError(response => of(new ActionCommentEditError(response.data)))
				);
			})
		);

	@Effect()
	deleteComment = () =>
		this.actions$.pipe(
			ofType<CommentActions>(CommentActionTypes.DELETE),
			switchMap((action: ActionCommentDelete) => {
				this.notifications.info(`Deleting comment ${action.payload.commentId} for ${action.payload.key}`);

				return this.service.deleteComment(action.payload).pipe(
					map((response: any) => {
						this.notifications.success(`Successfully deleted comment ${action.payload.comment_id} for ${action.payload.key}`);
						return new ActionCommentDeleteSuccess(response.data);
					}),
					catchError(response => of(new ActionCommentDeleteError(response.data)))
				);
			})
		);

	/**
	 * generate notification for add log dialog
	 * @param action
	 */
	savingNotification(action) {
		let message = 'Performing the following actions:<br>';

		if (action.payload.comment) {
			message += `Adding comment for ${action.payload.key}<br>`;
		}

		if (action.payload.log_time) {
			const hours = action.payload.log_time >= 60 ? parseInt(action.payload.log_time) / 60 : 0;
			const minutes = parseInt(action.payload.log_time) % 60;
			message += `Adding time log of ${hours} hours and ${minutes} minutes<br>`;
		}

		if (action.payload.remove_merge) {
			message += `Removing merge conflict component<br>`;
		}

		if (action.payload.uctNotReady) {
			message += `Adding UCT not ready to comment<br>`;
		}

		this.notifications.info(message);
	}

	/**
	 * process API response for add log
	 * @param response
	 * @param action
	 */
	processSaveLog(response, action) {
		response.key = action.payload.key;
		let message = 'Successfully completed the following actions:<br>';

		const success_comment = response.comment_response && response.comment_response.status;
		if (success_comment) {
			message += `Saved comment<br>`;
		}

		const success_log = response.log_response && response.log_response.status;
		if (response.log_response && response.log_response.status) {
			message += `Added time log<br>`;
		}

		if (success_comment || success_log) {
			this.store.dispatch(new ActionCommentSaveSuccess(response));
		}

		if (response.conflict_response && response.conflict_response.status) {
			message += `Removed Merge Conflict component<br>`;
			this.store.dispatch(new ActionStatusSaveSuccess(response.conflict_response));
		}

		if (response.merge_response && response.merge_response.status) {
			message += `Removed Merge Code component<br>`;
			this.store.dispatch(new ActionStatusSaveSuccess(response.merge_response));
		}

		this.notifications.success(message);
	}
}
