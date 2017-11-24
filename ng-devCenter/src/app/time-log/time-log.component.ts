import { 
	Component, ViewChild, 
	ElementRef, ViewContainerRef, 
	ViewEncapsulation 
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

		let postData = {
			comment: formData.comment,
			log_time: formData.logTime.hour * 60 + formData.logTime.minute,
			key: this.key
		};

		// log work and show results
		this.jira.workLog(postData).subscribe( 
			() => this.toastr.showToast('Work Log updated', 'success'),
			error => this.toastr.showToast(error, 'error')
		);
	}

	openLogModal(key:string):void {

		this.key = key;

		// open modal
		this.modalReference = this.modalService
			.open(this.content, { windowClass: 'log-modal' })

		// once modal is closed if we just exited out then reset inputs
		this.modalReference.result.then( () => {}, () => null);
	}

}
