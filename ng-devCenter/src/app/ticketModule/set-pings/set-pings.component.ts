import { 
	Component, Input, ViewChild, ElementRef, 
	ChangeDetectionStrategy, ChangeDetectorRef 
} from '@angular/core';

import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './../../shared/modal/modal.component';
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';
import { MiscService } from './../../shared/services/misc.service';

@Component({
	selector: 'dc-set-pings',
	templateUrl: './set-pings.component.html',
	styleUrls: ['./set-pings.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetPingsComponent {

	@Input() key;
	@Input() commit;
	@Input() branch;
	@Input() sprint;

	customModalCss ='setPings';
	modalInstance: NgbModalRef;
	@ViewChild(ModalComponent) modal: ModalComponent;

	constructor(
		private toastr: ToastrService, private jira: JiraService,
		public misc: MiscService, private cd: ChangeDetectorRef
	){}

	/**
	*/
	openPingModel(){
		this.cd.detectChanges();
		this.modalInstance = this.modal.openModal();
	}


	/**
	*/
	closePingModal(pingType){

		// close modal
		this.modalInstance.close();

		// if we have a ping type then call it
		if(pingType){
			this.jira.setPing({
				key: this.key,
				ping_type: pingType
			}).subscribe(
				response => {
					pingType = pingType.replace('_', ' ');
					this.toastr.showToast(`${pingType} ping reset: ${response.data}`, 'success');
				},
				error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
			);
		}
	}
}
