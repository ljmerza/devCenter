import {Injectable} from '@angular/core';

import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';

import {
	ActionCommentSaveSuccess,
	ActionStatusSaveSuccess,
	ActionStatusSaveError,

	QaGeneratorActions,
	QaGeneratorActionTypes,
	ActionStatusQaSave,
	ActionStatusQaSaveSuccess,
	ActionStatusQaSaveError,
} from '../actions';

import {StatusService} from '../services';
import {NotificationService} from '@app/core/notifications/notification.service';

@Injectable()
export class QaGeneratorEffects {
	constructor(public store: Store<{}>, private actions$: Actions<Action>, private service: StatusService, private notifications: NotificationService) {}

	@Effect({dispatch: false})
	generateQa = () =>
		this.actions$.pipe(
			ofType<QaGeneratorActions>(QaGeneratorActionTypes.SAVE_QA),
			switchMap((action: ActionStatusQaSave) => {
				this.savingNotification(action);

				return this.service.generateQa(action.payload).pipe(
					map(response => this.processGenerateQa(response, action)),
				);
			})
		);

	/**
	 *
	 * Possible responses:
	 *		pull_response, dev_change_response, qa_comment_response, qa_info_response, log_response
	 *		from set_status:
	 *			pr_add_response, status_response, comment_response, new_response
	 *				commit_ids, commit_comment (from add_commits_table_comment)
	 * @param response
	 * @param action
	 */
	processGenerateQa(response, action) {
		const key = action.payload.key;

		if (!response.status) {
			this.notifications.error(`Error generating QA workflow for ${key}: ${response.data}`);
			return this.store.dispatch(new ActionStatusQaSaveError(response.data));
		}

		let success: string = '';

		// check for qa add comment response
		const addLogResponse = {key, comment_response: false, log_response: false};
		if (response.data.qa_comment_response && response.data.qa_comment_response.status) {
			addLogResponse.comment_response = response.data.qa_comment_response;
			success += `Added QA comment<br>`;
		} else if (response.data.qa_comment_response && action.payload.qa_steps) {
			this.notifications.error(`Error adding QA steps for ${key}: ${response.data.comment_response.data}`);
		}

		// check for pull response
		if (response.data.pull_response && response.data.pull_response.status) {
			let pullRequestSuccesses = '';

			response.data.pull_response.data.forEach(pullRequest => {
				if (pullRequest.error) {
					this.notifications.error(`Error creating pull request for ${key} for repo ${pullRequest.repo}: ${pullRequest.error}`);
				} else {
					pullRequestSuccesses += `<a href='${pullRequest.link}' target='_blank'>${pullRequest.repo}</a><br>`;
				}
			});

			if (pullRequestSuccesses) {
				response.data.pull_response.data.key = key;
				this.store.dispatch(new ActionStatusQaSaveSuccess(response.data.pull_response.data));
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
		if (addLogResponse.comment_response || addLogResponse.log_response) {
			this.store.dispatch(new ActionCommentSaveSuccess(addLogResponse));
		}

		// check for status change response
		if (response.data.status_response && response.data.status_response.status) {
			this.store.dispatch(new ActionStatusSaveSuccess(response.data.new_response.data));
			success += `Transitioned to PCR Ready<br>`;

		} else if (response.data.status_response) {
			this.store.dispatch(new ActionStatusSaveError(response.data.status_response.data));
			this.notifications.error(`Error changing status for ${key}: ${response.data.status_response.data}`);
		}

		// check dev changes
		if (response.data.dev_change_response && response.data.dev_change_response.status) {
			success += `Added pull requests to dev changes`;
		} else if (response.data.dev_change_response) {
			this.notifications.error(`Error adding dev changes notes for ${key}: ${response.data.dev_change_response.data}`);
		}

		// check qa additonal info changes
		if (response.data.qa_info_response && response.data.qa_info_response.status) {
			success += `Added QA additional info`;
		} else if (response.data.qa_info_response) {
			this.notifications.error(`Error adding QA additional info for ${key}: ${response.data.qa_info_response.data}`);
		}

		if (success) this.notifications.success(`Successfully completed the following actions:<br>${success}`);
	}

	/**
	 * generate info notification for form submission
	 * @param action
	 */
	savingNotification(action) {
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
