import { 
	Component, ViewChild, EventEmitter,
	ElementRef, ViewContainerRef, 
	ViewEncapsulation, Output 
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

	key:string;
	comments:string;
	logTime = {hour: 0, minute: 0};

	hourStep = 1;
	minuteStep = 15;

	@ViewChild('logModal') content:ElementRef;
	@Output() logTimeEvent = new EventEmitter();

	constructor(
		public jira:JiraService,
		public toastr: ToastrService,
		private modalService:NgbModal,
		public vcr: ViewContainerRef
	) { 
		this.toastr.toastr.setRootViewContainerRef(vcr);
	}

	submitLog(formObj: NgForm) {

		// close modal
		this.modalReference.close();

		// get form values and reset form
		const formData = formObj.value;
		formObj.resetForm();

		if(!formData.comment){
			this.toastr.showToast('Must enter a comment to update Jira', 'error');
			return;
		}

		let postData = {
			comment: formData.comment,
			log_time: formData.logTime.hour * 60 + formData.logTime.minute,
			key: this.key
		};

		// log work and show results
		this.jira.workLog(postData).subscribe( 
			() => {

				// show success and notify table to update time
				this.toastr.showToast('Work Log updated', 'success');
				this.logTimeEvent.emit({key: this.key, logTime: postData.log_time});
			},
			error => this.toastr.showToast(error.data, 'error')
		);
	}

	openLogModal(key:string):void {

		// set values
		this.key = key;
		this.comments = '';
		this.logTime = {hour: 0, minute: 0};

		// open modal
		this.modalReference = this.modalService
			.open(this.content, { windowClass: 'log-modal' });
	}

}
