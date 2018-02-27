import { 
	Component, OnInit, ElementRef, ChangeDetectionStrategy,
	EventEmitter, Input, Output, ViewChild, ChangeDetectorRef
} from '@angular/core';

import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '@modal';
import { JiraService, ToastrService, UserService } from '@services';


@Component({
	selector: 'dc-modal',
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
	modalRef: NgbModalRef;

	constructor(
		private user: UserService, public toastr: ToastrService, 
		public jira: JiraService, private cd: ChangeDetectorRef
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


		// detect changes then open modal
		this.cd.detectChanges();
		this.modalRef = this.modal.openModal();

		// set dismiss event to trigger status cancel
		this.modalRef.result.then(
    		() => null,
    		() => this.statusChange.emit({showMessage:true, cancelled:true})
    	)
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
		this.modalRef.close();	
	}

	/**
	*/
	changeStatus(statusType:string): void {
		this.jira.changeStatus({key:this.key, statusType, crucible_id:this.crucible_id})
		.subscribe(
			() => {
				this.toastr.showToast(`Status successfully changed for ${this.key}`, 'success');
				this.statusChange.emit({cancelled: false, showMessage: false});
			},
			error => {
				this.toastr.showToast(this.jira.processErrorResponse(error), 'error');
				this.statusChange.emit({cancelled: true, showMessage: true});
			}
		);
	}
}
