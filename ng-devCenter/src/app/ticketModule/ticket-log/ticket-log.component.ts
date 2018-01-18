import { 
	Component, ViewChild, EventEmitter, ChangeDetectionStrategy,
	ElementRef, ViewEncapsulation, Output, Input, ChangeDetectorRef
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModalRef, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

import { ModalComponent } from './../../shared/modal/modal.component';
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';

@Component({
	selector: 'dc-ticket-log',
	templateUrl: './ticket-log.component.html',
	styleUrls: ['./ticket-log.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketLogComponent	{
	modalReference;

	uctNotReady: false;
	mergedCode: false;
	conflictCode: false;
	comment:string;
	logTime = {hour: 0, minute: 0};

	hourStep = 1;
	minuteStep = 15;

	customModalCss = 'timeLog';

	@ViewChild(ModalComponent) modal: ModalComponent;
	@Output() commentChangeEvent = new EventEmitter();
	@Output() statusChangeCancel = new EventEmitter();
	@Input() key:string;
	modalRef: NgbModalRef;

	constructor(
		public jira:JiraService, public toastr: ToastrService, 
		private cd: ChangeDetectorRef
	) {}

	/*
	*/
	submitLog(formObj?:NgForm) {

		// close modal
		this.modalRef.close();

		if(!formObj) return;
		
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

		// show composed info message
		this.toastr.showToast(`Running the following tasks: ${message.join(', ')}`, 'info');

		// do we construct UCT not ready comment?
		const uct_date = formObj.value.uctNotReady ? ((new Date).getTime())/1000 : 0;

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
			(response) => {

				// if we added uct date then we need to let events know
				// there's an added 'comment'
				if(uct_date){
					postData.comment += uct_date;
				}

				// show success and notify table to update time
				this.toastr.showToast('Work Log updated', 'success');
				this.commentChangeEvent.emit({postData, response});

				// then reset form - manual reset because logTime object becomes null on formObj.formReset()
				this._resetForm();
			},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

	/*
	*/
	openLogModal():void {
		this.cd.detectChanges();
		this.modalRef = this.modal.openModal();
	}

	/*
	*/
	_resetForm(){
		this.uctNotReady = false;
		this.mergedCode = false;
		this.conflictCode = false;
		this.comment = '';
		this.logTime = {hour: 0, minute: 0};
	}

}
