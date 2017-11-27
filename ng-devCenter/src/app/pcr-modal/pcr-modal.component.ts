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

	@ViewChild('pcrModal') content: ElementRef;
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
	openPCRModal(statusType): void {

		// check for crucible id first
		if(!this.crucible_id){
			this.toastr.showToast(`Missing Crucible ID. Cannot transition ${this.key}`, 'error');
			this.pcrPassEvent.emit({key:this.key, isTransitioned: false, showToast: false});
			return;
		}

		// save status type for template
		this.statusType = statusType;

		// open modal then on close process result
		this.modalService.open(this.content).result.then( confirm => {

			this.jira.pcrPass(this.crucible_id, this.user.username).subscribe( 
				() => this.toastr.showToast('PCR Passed.', 'success'), 
				error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
			);

			// if we want PCR complete then	call PCR complete API 
			if(statusType === 'complete'){						
				this.jira.pcrComplete(this.key, this.user.username).subscribe( 
					() => {

						// notify to remove ticket from table and show notification
						this.pcrPassEvent.emit({key:this.key, isTransitioned: true});	
						this.toastr.showToast('PCR Completed.', 'success');
					},
					error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
				);
			}

		}, () => this.pcrPassEvent.emit({key:this.key, isTransitioned: false}) );	
	}

}
