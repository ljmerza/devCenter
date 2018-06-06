import { Component, ViewChild, EventEmitter, ChangeDetectionStrategy, ElementRef, ViewEncapsulation, Output, Input, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModalRef, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgRedux } from '@angular-redux/store';

import { ModalComponent } from '@modal';
import { JiraCommentsService, ToastrService, MiscService } from '@services';
import { RootState, Actions } from '@store';
import { statuses, Ticket, Comment } from '@models';

@Component({
	selector: 'dc-work-log',
	templateUrl: './work-log.component.html',
	styleUrls: ['./work-log.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkLogComponent {
	modalRef: NgbModalRef;

	// form input values
	uctNotReady:boolean = false;
	mergedCode:boolean = false;
	conflictCode:boolean = false;
	comment:string = '';
	logTime = {hour: 0, minute: 0};
	hourStep:number = 1;
	minuteStep:number = 15;

	modalSize = 'timeLog';

	@ViewChild(ModalComponent) modal: ModalComponent;
	@Input() key:string;
	@Input() msrp:string;
	@Input() masterBranch: string;
	@Input() branch: string;
	@Input() commit: string;

	constructor(
		public jira:JiraCommentsService, public toastr: ToastrService, private cd: ChangeDetectorRef, 
		private store:NgRedux<RootState>, public misc: MiscService
		) {}

	/**
	 * Submits a work log form to add/remove components, log time, and add a comment.
	 * @param {NgForm} formObj the reactive form object with all the inputs' values 
	 */
	submitLog(formObj?:NgForm) {
		this.modalRef.close();
		if(!formObj) return;

		const tasks = this.buildToastMessage(formObj);
		this.toastr.showToast(`Running the following tasks: ${tasks} for ${this.key}`, 'info');

		// add UCT not ready to comment if selected
		formObj.value.comment = formObj.value.comment || '';
		if(formObj.value.uctNotReady) formObj.value.comment += `\n\n{color:red}UCT not ready as of ${new Date}{color}`;

		// create POST body
		let postData = {
			comment: formObj.value.comment || '',
			remove_merge: formObj.value.mergedCode || false,
			remove_conflict: formObj.value.conflictCode || false,
			log_time: formObj.value.logTime.hour * 60 + formObj.value.logTime.minute,
			key: this.key,
			master_branch: this.masterBranch,
			tasks: tasks
		};

		this.jira.workLog(postData).subscribe(
			(response:any) => this.checkWorklogEvents(response.data, postData, formObj),
			this.jira.processErrorResponse.bind(this.jira)
		);
	}

	/**
	 * check for the status of updating a comment, adding worklog, or changing a merge/conflict status.
	 * @param {ApiResponse} responseData
	 * @param {Object} postData
	 */
	checkWorklogEvents(responseData:any, postData:any, formObj?:NgForm){
		let errorMessage = '';
		responseData.key = this.key;
		let successMessage = `Tasks updated for ${this.key}: ${postData.tasks}`;

		// check for comment response
		if(responseData.comment_response.status){
			this.store.dispatch({ type: Actions.addComment, payload: responseData.comment_response.data });	
		} else if( responseData.comment_response.status === false && postData.comment){
			errorMessage += `adding Jira comment: ${responseData.comment_response.data}\n`;
		}

		// check for work log response
		if(responseData.log_response.status){
			const payload = {key: this.key, loggedSeconds: responseData.log_response.data.timeSpentSeconds};
			this.store.dispatch({ type: Actions.updateWorklog, payload });	

		} else if(responseData.log_response.status === false && postData.log_time){
			errorMessage += `adding work log: ${responseData.log_response.data}\n`;
		}

		// check for status change responses
		if(responseData.merge_response.status || responseData.conflict_response.status){
			const merge = responseData.merge_response.status;
			const status = merge ? statuses.UCTREADY.frontend : statuses.QAREADY.frontend;
			this.store.dispatch({type: Actions.updateStatus, payload:{ key:this.key, status}});

			// if we removed merge and commit Jira comment was success then add comment to ticket
			if(responseData.commit_comment_response.status){
				this.store.dispatch({ type: Actions.addComment, payload: responseData.commit_comment_response.data});	
			}

		} else if(responseData.merge_response.status === false && postData.remove_merge){
			errorMessage += `removing merge code status: ${responseData.merge_response.data}\n`;

		} else if(responseData.conflict_response.status === false && postData.remove_conflict){
			errorMessage += responseData.conflict_response.data;
			errorMessage += `removing merge conflict status: ${responseData.conflict_response.data}\n`;
		}

		else if(responseData.commit_response.status === false  && postData.remove_merge){
			errorMessage += `getting commit ids: ${responseData.commit_response.data}\n`;
		}
		else if(responseData.commit_comment_response.status === false && postData.remove_merge){
			errorMessage += `adding commit Jira coment: ${responseData.commit_response.data}\n`;
		}

		// show any errors
		if(errorMessage) {
			this.toastr.showToast(`The following errors have occurred:\n ${errorMessage}`, 'error');
		} else {
			this.resetForm();
			this.toastr.showToast(successMessage, 'success');
		}
	}

	/**
	 * resets form manually 
	 */
	resetForm(){
		this.uctNotReady = false;
		this.mergedCode = false;
		this.conflictCode = false;
		this.comment = '';
		this.logTime = {hour: 0, minute: 0};
		this.hourStep = 1;
		this.minuteStep = 15;
	}

	/**
	 * Checks if we made a status change on the ticket.
	 * @param {any} postData data sent to server
	 */
	checkStatusChange(postData:any){

		let newStatus;
		if(postData.remove_merge){
			newStatus = statuses.UCTREADY.frontend;
		} else if(postData.remove_conflict){
			newStatus = statuses.QAREADY.frontend;
		}
	}

	/**
	 * Builds a toastr message based on form input.
	 * @param {NgForm} formObj the form object with all the input values.
	 * @return {string} the message string to show on the toastr message.
	 */
	buildToastMessage(formObj:NgForm): string {
		// check for change type
		let message = [];
		if (formObj.value.logTime.hour || formObj.value.logTime.minute){
			message.push('adding time log');
		}
		if(formObj.value.conflictCode){
			message.push('removing merge conflict component');
		} 
		if(formObj.value.mergedCode){
			message.push('removing merge code component and posting commit ids to Jira');
		} 

		if(formObj.value.comment){
			message.push('posting comment');
		}
		if(formObj.value.uctNotReady){
			message.push('posting UCT Not Ready comment');
		}
		// get string of all tasks to complete
		return message.join(', ');
	}

	/**
	 * Opens the work log dialog.
	 */
	openLogModal():void {
		this.cd.detectChanges();
		this.modalRef = this.modal.openModal();
	}
}