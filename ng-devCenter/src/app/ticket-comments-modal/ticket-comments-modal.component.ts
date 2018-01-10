import { 
	Component, ViewChild, EventEmitter,
	ViewEncapsulation, Input, Output, ChangeDetectionStrategy
} from '@angular/core';

import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './../modal/modal.component';
import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';
import { UserService } from './../services/user.service';
import { MiscService } from './../services/misc.service';

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
	@Input() comments;
	@Input() attachments;
	@Output() commentChangeEvent = new EventEmitter();
	@ViewChild(ModalComponent) modal: ModalComponent;

	constructor() {}

  	/**
  	*/
	openCommentModal(): void {
		setTimeout( () => {
			this.modalRef = this.modal.openModal();
		});
	}

	/**
	*/
	closeCommentModal() {
		this.modalRef.close();
	}

	/**
	*/
	commentChangeEventBubble(event){
		this.commentChangeEvent.emit(event);
	}
}
