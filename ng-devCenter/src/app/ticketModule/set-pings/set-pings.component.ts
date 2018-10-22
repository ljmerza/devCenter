import { Component, Input, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ModalComponent } from './../../shared/modal/modal.component';
import { ToastrService, JiraPingsService, MiscService } from '@services';

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
	@Input() masterBranch;
	@Input() epic_link;

	modalSize = {width: '700px', height: '350px'};
	@ViewChild(ModalComponent) modal: ModalComponent;

	constructor(private toastr: ToastrService, private jira: JiraPingsService, private cd: ChangeDetectorRef, public misc: MiscService){}

	openModal(){
		this.modal && this.modal.openModal();
	}
	
	/**
	 * Closes the modal and if user wants a ping then send it to them.
	 * @param {string} pingType the type of ping to send (new or merge)
	 */
	setPing(pingType:string){
		this.modal.closeModal();
		if(!pingType) return;

		this.toastr.showToast(`Sending a ${pingType} ping`, 'info');
		this.jira.setPing({key: this.key, pingType, epic_link: this.epic_link}).subscribe(
			response => {
				pingType = pingType.replace('_', ' ');
				this.toastr.showToast(`${pingType} ping reset: ${response.data}`, 'success');
			},
			this.jira.processErrorResponse.bind(this.jira)
		);
		
	}
}