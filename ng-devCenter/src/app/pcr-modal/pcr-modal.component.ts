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
	selector: 'app-pcr-modal',
	templateUrl: './pcr-modal.component.html',
	styleUrls: ['./pcr-modal.component.scss']
})
export class PcrModalComponent {

	@ViewChild('statusModal') content: ElementRef;
	@Output() statusChangeEvent = new EventEmitter();
	@Input() crucible_id;
	@Input() key;
	statusType;

	constructor(
		private user: UserService, 
		public toastr: ToastrService, 
		public jira: JiraService, 
		private modalService: NgbModal,
		vcr: ViewContainerRef
	) {
		this.toastr.toastr.setRootViewContainerRef(vcr);
	}

	/*
	*/
	openStatusModal(statusType): void {
		this.statusType = statusType

		// check for crucible id first for pcr pass/complete
		if(['pass', 'complete'].includes(statusType) && !this.crucible_id){
			this.toastr.showToast(`Missing Crucible ID. Cannot transition ${this.key}`, 'error');
			this.statusChangeEvent.emit({cancel:true});
			return;
		}

		// open modal then on close process result
		this.modalService.open(this.content).result.then( () => {
			switch(statusType){
				case 'complete':
					this.pcrComplete();
				case 'pass':
					this.pcrPass();
					break;
				default:
					this.changeStatus(statusType);
					break;
			}

		}, () => this.statusChangeEvent.emit({cancel:true}) );	
	}

	/*
	*/
	pcrPass() {
		this.jira.pcrPass(this.crucible_id, this.user.username).subscribe( 
			() => {
				this.toastr.showToast('PCR Passed.', 'success');
				this.statusChangeEvent.emit({transitionType: 'pass'});
			},
			error => {
				this.toastr.showToast(this.jira.processErrorResponse(error), 'error');
				this.statusChangeEvent.emit({cancel:true});
			}
		);
	}

	/*
	*/
	pcrComplete() {
		this.jira.pcrComplete(this.key, this.user.username).subscribe( 
			() => {
				this.toastr.showToast('PCR Completed.', 'success');
				this.statusChangeEvent.emit({transitionType: 'complete'});
			},
			error => {
				this.toastr.showToast(this.jira.processErrorResponse(error), 'error');
				this.statusChangeEvent.emit({cancel:true});
			}
		);
	}

	/*
	*/
	changeStatus(statusType) {
		this.jira.changeStatus({key:this.key, status:statusType})
		.subscribe(
			() => {
				this.toastr.showToast(`Status successfully changed for ${this.key}`, 'success');
				this.statusChangeEvent.emit({transitionType: statusType});
			},
			error => {
				this.toastr.showToast(this.jira.processErrorResponse(error), 'error');
				this.statusChangeEvent.emit({cancel:true});
			}
		);
	}
}
