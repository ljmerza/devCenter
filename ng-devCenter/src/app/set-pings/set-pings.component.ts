import { Component, Input, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';

import { ModalComponent } from './../modal/modal.component';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';
import { MiscService } from './../services/misc.service';

@Component({
	selector: 'app-set-pings',
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
		public misc: MiscService
	){}

	/**
	*/
	openPingModel(){
		setTimeout( () => {
			this.modalInstance = this.modal.openModal();
		});
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
