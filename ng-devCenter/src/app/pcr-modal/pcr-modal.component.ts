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
	@Output() pcrPassEvent = new EventEmitter();
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
			this.pcrPassEvent.emit({key:this.key, isTransitioned: false, showToast: false});
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
				case 'inDev':
					this.inDev();
					break;
				case 'inQA':
					this.inQA();
					break;
				case 'qaFail':
					this.qaFail();
					break;
				case 'qaPass':
					this.qaPass();
					break;
			}

		
		
		}, () => this.pcrPassEvent.emit({key:this.key, isTransitioned: false}) );	
	}

	/*
	*/
	pcrPass() {
		this.jira.pcrPass(this.crucible_id, this.user.username).subscribe( 
			() => this.toastr.showToast('PCR Passed.', 'success'), 
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

	/*
	*/
	pcrComplete() {
		this.jira.pcrComplete(this.key, this.user.username).subscribe( 
			() => {

				// notify to remove ticket from table and show notification
				this.pcrPassEvent.emit({key:this.key, isTransitioned: true});	
				this.toastr.showToast('PCR Completed.', 'success');
			},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

	inDev() {
		console.log('indev');
	}

	inQA() {

	}

	qaFail() {

	}

	qaPass() {

	}

}
