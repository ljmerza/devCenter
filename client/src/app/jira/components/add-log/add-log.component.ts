import {Component, OnInit, OnDestroy, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import {NgForm} from '@angular/forms';

import {Store, select} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';

import {selectComments} from '../../selectors/';
import {ActionCommentSave} from '../../actions';

import {PanelComponent} from '@app/panel/components/panel/panel.component';

@Component({
	selector: 'dc-add-log',
	templateUrl: './add-log.component.html',
	styleUrls: ['./add-log.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class AddLogComponent implements OnInit, OnDestroy {
	@ViewChild(PanelComponent) modal: PanelComponent;
	@Input() ticket;

	state$: Subscription;
	loading = false;

	uctNotReady = false;
	conflictCode = false;
	privateComment = true;
	comment = '';
	logTime = {hour: 0, minute: 0};
	hourStep = 1;
	minuteStep = 15;

	constructor(public store: Store<{}>) {}

	ngOnInit() {
		// watch for errors
		this.state$ = this.store
			.pipe(
				select(selectComments),
				tap(state => {
					if (this.loading) this.loading = state.loading;
					if (!state.error) this.resetForm();
				})
			)
			.subscribe(_ => {});
	}

	ngOnDestroy() {
		this.state$.unsubscribe();
	}

	cancel() {
		this.resetForm();
		this.modal.closeModal();
	}

	/**
	 * Submits a work log form to add/remove components, log time, and add a comment.
	 * @param {NgForm} formObj the reactive form object with all the inputs' values
	 */
	onSubmit(formObj?: NgForm) {
		this.modal.closeModal();
		if (!formObj) return;

		const logTime = formObj.value.logTime.hour * 60 + formObj.value.logTime.minute;
		let comment = formObj.value.comment || '';
		
		this.loading = true;
		if (formObj.value.uctNotReady) {
			comment += `\n\n{color:red}UCT not ready as of ${new Date()}{color}`;
		}

		this.store.dispatch(
			new ActionCommentSave({
				comment,
				private_comment: formObj.value.privateComment,
				remove_conflict: formObj.value.conflictCode,
				log_time: logTime,
				key: this.ticket.key,
				master_branch: this.ticket.master_branch,
			})
		);
	}

	/**
	 * reset the form
	 */
	resetForm() {
		this.uctNotReady = false;
		this.conflictCode = false;
		this.comment = '';
		this.logTime = {hour: 0, minute: 0};
		this.hourStep = 1;
		this.minuteStep = 15;
		this.privateComment = true;
	}
}
