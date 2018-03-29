import { 
	Component, ViewChild, ChangeDetectionStrategy,
	ViewEncapsulation, Input,
} from '@angular/core';

import { ModalComponent } from '@modal';

@Component({
	selector: 'ticket-comments-modal',
	templateUrl: './ticket-comments-modal.component.html',
	styleUrls: ['./ticket-comments-modal.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketCommentsModalComponent {
	modalSize = 'xlg';
	@Input() key;
	@ViewChild(ModalComponent) modal: ModalComponent;

	constructor() {}

	openModal(){
		this.modal.openModal();		
	}
}
