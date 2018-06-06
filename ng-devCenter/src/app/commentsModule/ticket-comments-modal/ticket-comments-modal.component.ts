import { 
	Component, ViewChild, ChangeDetectorRef,
	ViewEncapsulation, Input, Output, ChangeDetectionStrategy
} from '@angular/core';

import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '@modal';
import { JiraService, ToastrService, MiscService, UserService } from '@services';
import { DataService } from './../../shared/services/data.service';

@Component({
	selector: 'ticket-comments-modal',
	templateUrl: './ticket-comments-modal.component.html',
	styleUrls: ['./ticket-comments-modal.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketCommentsModalComponent {

	modalRef: NgbModalRef;
	modalSize = 'ticketComments';
	@Input() key;
	@Input() ticketListType;
	@ViewChild(ModalComponent) modal: ModalComponent;

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
