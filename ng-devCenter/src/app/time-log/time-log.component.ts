import { 
	Component, ViewChild, EventEmitter,
	ElementRef, ViewEncapsulation, Output, Input
} from '@angular/core';

import { NgbModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';

import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';


@Component({
	selector: 'app-time-log',
	templateUrl: './time-log.component.html',
	styleUrls: ['./time-log.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class TimeLogComponent	{
	modalReference;

	uctNotReady;
	mergedCode;
	conflictCode;
	comments:string;
	logTime = {hour: 0, minute: 0};

	hourStep = 1;
	minuteStep = 15;

	@ViewChild('logModal') content:ElementRef;
	@Output() logTimeEvent = new EventEmitter();
	@Output() statusChangeCancel = new EventEmitter();
	@Input() key:string;

	constructor(
		public jira:JiraService,
		public toastr: ToastrService,
		private modalService:NgbModal
	) {}

	/*
	*/
	submitLog(formObj: NgForm) {

		// close modal
		this.modalReference.close();
		
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
			() => {

				// show success and notify table to update time
				this.toastr.showToast('Work Log updated', 'success');
				this.logTimeEvent.emit({key: this.key, logTime: postData.log_time});
				// then reset form
				formObj.resetForm();
			},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

	/*
	*/
	openLogModal():void {

		// set values
		this.comments = '';
		this.logTime = {hour: 0, minute: 0};

		// open modal
		this.modalReference = this.modalService
			.open(this.content, { windowClass: 'log-modal' });

		this.modalReference.result.then(
			// always reset form
			() => this._resetForm(),
			() => this._resetForm()
		);
	}

	/*
	*/
	_resetForm(){
		this.uctNotReady = false;
		this.mergedCode = false;
		this.conflictCode = false;

	}

}
