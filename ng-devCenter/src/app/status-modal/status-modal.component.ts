import { 
	Component, OnInit, ElementRef, ChangeDetectionStrategy,
	EventEmitter, Input, Output, ViewChild
} from '@angular/core';

import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './../modal/modal.component';
import { UserService } from './../services/user.service';
import { ToastrService } from './../services/toastr.service';
import { JiraService } from './../services/jira.service';


@Component({
	selector: 'app-status-modal',
	templateUrl: './status-modal.component.html',
	styleUrls: ['./status-modal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusModalComponent {

	@ViewChild(ModalComponent) modal: ModalComponent;
	@Output() statusChange = new EventEmitter();
	@Input() crucible_id: string;
	@Input() key: string;
	statusType: string;
	statusName: string;
	modelRef: NgbModalRef;

	constructor(
		private user: UserService, public toastr: ToastrService, 
		public jira: JiraService
	) {}

	/**
	*/
	openStatusModal(statusType:string, statusName:string): void {

		// save data to modal
		this.statusType = statusType
		this.statusName = statusName;

		// check for crucible id first for pcr pass/complete
		if(['pass', 'complete'].includes(statusType) && !this.crucible_id){
			this.toastr.showToast(`Missing Crucible ID. Cannot transition ${this.key}`, 'error');
			this.statusChange.emit({cancelled: true, showMessage: true});
			return;
		}

		// open modal
		this.modelRef = this.modal.openModal();
	}

	/**
	*/
	closeStatusModal(submit:boolean=false): void{

		// if we are submitting then update status
		if(submit){
			switch(this.statusType){
				case 'complete':
					this.changeStatus('pcrPass');
					this.changeStatus('pcrComplete');
					break;
				default:
					this.changeStatus(this.statusType);
					break;
			}
		} else {
			// else cancel status
			this.statusChange.emit({cancelled: true, showMessage: true}) 
		}

		// always close modal
		this.modelRef.close();	
	}

	/**
	*/
	changeStatus(statusType:string): void {
		this.jira.changeStatus({key:this.key, statusType, crucible_id:this.crucible_id})
		.subscribe(
			() => {
				this.toastr.showToast(`Status successfully changed for ${this.key}`, 'success');
				this.statusChange.emit({cancelled: false, showMessage:['pcrPass', 'qaPass'].includes(statusType)});
			},
			error => {
				this.toastr.showToast(this.jira.processErrorResponse(error), 'error');
				this.statusChange.emit();
			}
		);
	}
}
