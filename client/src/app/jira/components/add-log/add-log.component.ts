import { Component, OnInit, OnDestroy, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { selectJiraState } from '../../selectors';
import { JiraTicketsState, JiraTicket } from '../../models';
import { ActionCommentSave } from '../../actions';

import { selectSettings } from '@app/settings/settings.selectors';
import { PanelComponent } from '@app/panel/components/panel/panel.component';

@Component({
	selector: 'dc-add-log',
	templateUrl: './add-log.component.html',
	styleUrls: ['./add-log.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AddLogComponent implements OnInit, OnDestroy {
	@ViewChild(PanelComponent) modal: PanelComponent;
	@Input() ticket;

	state$;
	loading;

	uctNotReady:boolean = false;
	conflictCode:boolean = false;
	comment:string = '';
	logTime = {hour: 0, minute: 0};
	hourStep:number = 1;
	minuteStep:number = 15;

	constructor(public store: Store<{}>) { }

	ngOnInit() {

		// watch for errors
		this.state$ = this.store.pipe(
			select(selectJiraState),
			tap(state => {
				if(this.loading) this.loading = state.commentsLoading;
				if(!state.commentsError) this.resetForm();
			}),
		)
		.subscribe(_ => {});
	}

	ngOnDestroy() {
    	this.state$.unsubscribe();
  	}

	cancel(){
		this.resetForm();
		this.modal.closeModal();
	}

	/**
	 * Submits a work log form to add/remove components, log time, and add a comment.
	 * @param {NgForm} formObj the reactive form object with all the inputs' values 
	 */
	onSubmit(formObj?:NgForm) {
		this.modal.closeModal();
		if(!formObj) return;


		let {comment='', conflictCode=false, uctNotReady=false} = formObj.value;
		const logTime = formObj.value.logTime.hour * 60 + formObj.value.logTime.minute;

		if(uctNotReady) {
			comment += `\n\n{color:red}UCT not ready as of ${new Date}{color}`;
		}

		this.loading = true;
		this.store.dispatch(new ActionCommentSave({
			comment,
			remove_conflict: conflictCode,
			log_time: logTime,
			key: this.ticket.key,
			master_branch: this.ticket.master_branch
		}));
	}


	resetForm(){
		this.uctNotReady = false;
		this.conflictCode = false;
		this.comment = '';
		this.logTime = {hour: 0, minute: 0};
		this.hourStep = 1;
		this.minuteStep = 15;
	}

}
