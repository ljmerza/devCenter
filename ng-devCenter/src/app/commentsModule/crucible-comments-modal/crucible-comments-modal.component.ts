import { 
	Component, ViewChild, ChangeDetectorRef,
	ViewEncapsulation, Input, Output, ChangeDetectionStrategy
} from '@angular/core';

import { NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '@modal';
import { JiraService, ToastrService, MiscService, UserService } from '@services';

@Component({
	selector: 'crucible-comments-modal',
	templateUrl: './crucible-comments-modal.component.html',
	styleUrls: ['./crucible-comments-modal.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrucibleCommentsModalComponent {

	modalRef: NgbModalRef;
	modalSize = 'ticketComments';
	@ViewChild(ModalComponent) modal: ModalComponent;
	@Input() crucibleId;

	constructor(private cd: ChangeDetectorRef) {}

  	/**
  	*/
	openModal(): void {
		this.cd.detectChanges();
		this.modalRef = this.modal.openModal();
	}

	/**
	*/
	closeModal() {
		this.modalRef.close();
	}
}
