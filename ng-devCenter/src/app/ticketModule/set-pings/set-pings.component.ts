import { Component, Input, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './../../shared/modal/modal.component';
import { ToastrService, JiraPingsService } from '@services';

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

	constructor(private toastr: ToastrService, private jira: JiraPingsService, private cd: ChangeDetectorRef){}

	/**
	 * opens the model for ths user to send a ping. 
	 */
	openPingModel(){
		this.cd.detectChanges();
		this.modalInstance = this.modal.openModal();
	}

	/**
	 * Clsoes the modal and if user wants a ping then send it to them.
	 * @param {string} pingType the type of ping to send (new or merge)
	 */
	closePingModal(pingType:string){
		this.modalInstance.close();

		if(pingType){
			this.jira.setPing({key: this.key, pingType}).subscribe(response => {
				pingType = pingType.replace('_', ' ');
				this.toastr.showToast(`${pingType} ping reset: ${response.data}`, 'success');
			});
		}
	}
}