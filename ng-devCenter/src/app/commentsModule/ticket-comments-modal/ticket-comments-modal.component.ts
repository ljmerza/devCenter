import { 
	Component, ViewChild, ChangeDetectorRef,
	ViewEncapsulation, Input, Output, ChangeDetectionStrategy
} from '@angular/core';

import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './../../shared/modal/modal.component';
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';
import { UserService } from './../../shared/services/user.service';
import { MiscService } from './../../shared/services/misc.service';

@Component({
	selector: 'ticket-comments-modal',
	templateUrl: './ticket-comments-modal.component.html',
	styleUrls: ['./ticket-comments-modal.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketCommentsModalComponent {

	modalRef: NgbModalRef;
	customModalCss = 'ticketComments';
	@Input() key;
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
