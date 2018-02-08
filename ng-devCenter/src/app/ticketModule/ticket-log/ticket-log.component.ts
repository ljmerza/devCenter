import { 
	Component, ViewChild, EventEmitter, ChangeDetectionStrategy,
	ElementRef, ViewEncapsulation, Output, Input, ChangeDetectorRef
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModalRef, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

import { ModalComponent } from './../../shared/modal/modal.component';
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';

import { NgRedux } from '@angular-redux/store';
import { RootState } from './../../shared/store/store';
import { Comment } from './../../shared/store/models/Comment';
import { Actions } from './../../shared/store/actions';
import { Ticket } from './../../shared/store/models/ticket';

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
	@Output() commentChangeEvent = new EventEmitter();
	@Output() statusChangeCancel = new EventEmitter();
	@Input() key:string;

	constructor(public jira:JiraService, public toastr: ToastrService, private cd: ChangeDetectorRef, private store:NgRedux<RootState>) {}

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
			key: this.key
		};

		// log work and show results
		this.jira.workLog(postData).subscribe( 
			response => {
				this.toastr.showToast(`Tasks updated: ${tasks}`, 'success');
				this.checkStatusChange(postData);
			
				response.data.key = this.key;
				this.store.dispatch({ type: Actions.addComment, payload:response.data });
				this._resetForm();
			},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

	/**
	 * Checks if we made a status change on the ticket.
	 * @param {any} postData data sent to server
	 */
	checkStatusChange(postData:any){

		let newStatus;
		if(postData.remove_merge){
			newStatus = 'Ready for UCT';
		} else if(postData.remove_conflict){
			newStatus = 'Ready for QA';
		}

		if(newStatus) this.commentChangeEvent.emit({newStatus});
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
	 * Opens the work log dialog
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