import { Component, ViewChild, EventEmitter, ChangeDetectionStrategy, ElementRef, ViewEncapsulation, Output, Input, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModalRef, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgRedux } from '@angular-redux/store';

import { ModalComponent } from '@modal';
import { JiraCommentsService, ToastrService } from '@services';
import { RootState, Actions } from '@store';
import { statuses, Ticket, Comment } from '@models';

@Component({
	selector: 'dc-ticket-log',
	templateUrl: './ticket-log.component.html',
	styleUrls: ['./ticket-log.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketLogComponent	{
	modalRef: NgbModalRef;

	// form input values
	uctNotReady:boolean = false;
	mergedCode:boolean = false;
	conflictCode:boolean = false;
	comment:string = '';
	logTime = {hour: 0, minute: 0};
	hourStep:number = 1;
	minuteStep:number = 15;

	customModalCss = 'timeLog';

	@ViewChild(ModalComponent) modal: ModalComponent;
	@Input() key:string;
	@Input() ticketListType:string;

	constructor(public jira:JiraCommentsService, public toastr: ToastrService, private cd: ChangeDetectorRef, private store:NgRedux<RootState>) {}

	/**
	 * Submits a work log form to add/remove components, log time, and add a comment.
	 * @param {NgForm} formObj the reactive form object with all the inputs' values 
	 */
	submitLog(formObj?:NgForm) {
		this.modalRef.close();
		if(!formObj) return;

		const tasks = this.buildToastMessage(formObj);
		this.toastr.showToast(`Running the following tasks: ${tasks}`, 'info');

		// create POST body
		let postData = {
			comment: formObj.value.comment || '',
			remove_merge: formObj.value.mergedCode || false,
			remove_conflict: formObj.value.conflictCode || false,
			uct_date: formObj.value.uctNotReady ? ((new Date).getTime())/1000 : 0,
			log_time: formObj.value.logTime.hour * 60 + formObj.value.logTime.minute,
			key: this.key,
			tasks: tasks
		};

		this.jira.workLog(postData).subscribe(
			(response:any) => this.checkWorklogEvents(response.data, postData),
			this.jira.processErrorResponse.bind(this.jira)
		);
	}

	/**
	 * check for the status of updating a comment, adding worklog, or changing a merge/conflict status.
	 * @param {ApiResponse} responseData
	 * @param {Object} postData
	 */
	checkWorklogEvents(responseData:any, postData:any){
		let errorMessage = '';
		responseData.key = this.key;

		// check for comment response
		if(responseData.comment_response.status){
			responseData.comment_response.data = this.ticketListType;
			this.store.dispatch({ type: Actions.addComment, payload: responseData.comment_response.data });	
		} else if( responseData.comment_response.status === false && (postData.comment || postData.uct_date) ){
			errorMessage += responseData.comment_response.data;
		}

		// check for work log response
		if(responseData.log_response.status){
			const payload = {key: this.key, loggedSeconds: responseData.log_response.data.timeSpentSeconds, ticketListType: this.ticketListType};
			this.store.dispatch({ type: Actions.updateWorklog, payload });	

		} else if(responseData.log_response.status === false && postData.log_time){
			errorMessage += responseData.comment_response.data;
		}

		// check for status change responses
		if(responseData.merge_response.status || responseData.conflict_response.status){
			const merge = responseData.merge_response.status;
			const status = merge ? statuses.UCTREADY.frontend : statuses.QAREADY.frontend;
			this.store.dispatch({type: Actions.updateStatus, payload:{ key:this.key, status, ticketListType: this.ticketListType }});

		} else if(responseData.merge_response.status === false && postData.remove_merge){
			errorMessage += responseData.comment_response.data;

		} else if(responseData.conflict_response.status === false && postData.remove_conflict){
			errorMessage += responseData.comment_response.data;
		}

		// show any errors
		if(errorMessage) {
			this.toastr.showToast(errorMessage, 'error');
		} else {			
			this.toastr.showToast(`Tasks updated: ${postData.tasks}`, 'success');
			this._resetForm();
		}
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
		if(formObj.value.mergedCode || formObj.value.conflictCode){
			message.push('removing component(s)');
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

	/**
	 * Manually resets the form values.
	 */
	_resetForm(){
		this.uctNotReady = false;
		this.mergedCode = false;
		this.conflictCode = false;
		this.comment = '';
		this.logTime = {hour: 0, minute: 0};
	}
}