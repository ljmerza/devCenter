import { 
	Component, OnInit, ViewContainerRef, 
	EventEmitter, Input, Output, ViewChild, 
	ElementRef 
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from './../services/user.service';
import { ToastrService } from './../services/toastr.service';
import { JiraService } from './../services/jira.service';


@Component({
	selector: 'app-status-modal',
	templateUrl: './status-modal.component.html',
	styleUrls: ['./status-modal.component.scss']
})
export class StatusModalComponent {

	@ViewChild('statusModal') content: ElementRef;
	@Output() statusChangeCancel = new EventEmitter();
	@Input() crucible_id;
	@Input() key;
	statusType;
	statusName;

	constructor(
		private user: UserService, 
		public toastr: ToastrService, 
		public jira: JiraService, 
		private modalService: NgbModal
	) {
	}

	/*
	*/
	openStatusModal(statusType, statusName): void {
		this.statusType = statusType
		this.statusName = statusName;

		// check for crucible id first for pcr pass/complete
		if(['pass', 'complete'].includes(statusType) && !this.crucible_id){
			this.toastr.showToast(`Missing Crucible ID. Cannot transition ${this.key}`, 'error');
			this.statusChangeCancel.emit();
			return;
		}

		// open modal then on close process result
		this.modalService.open(this.content).result.then( () => {
			switch(statusType){
				case 'complete':
					this.changeStatus('pcrPass');
					this.changeStatus('pcrComplete');
					break;
				default:
					this.changeStatus(statusType);
					break;
			}

		}, () => this.statusChangeCancel.emit() );	
	}

	/*
	*/
	changeStatus(statusType) {
		this.jira.changeStatus({key:this.key, statusType, crucible_id:this.crucible_id})
		.subscribe(
			() => this.toastr.showToast(`Status successfully changed for ${this.key}`, 'success'),
			error => {
				this.toastr.showToast(this.jira.processErrorResponse(error), 'error');
				this.statusChangeCancel.emit();
			}
		);
	}
}
