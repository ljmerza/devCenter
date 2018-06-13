import { Component, ViewChild, ViewEncapsulation, Input, ChangeDetectionStrategy} from '@angular/core';
import { ModalComponent } from '@modal';

@Component({
	selector: 'ticket-comments-modal',
	templateUrl: './ticket-comments-modal.component.html',
	styleUrls: ['./ticket-comments-modal.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketCommentsModalComponent {
	modalSize = {width: '1000px', height: '700px'};
	@Input() key;
	@Input() ticketListType;
	@ViewChild(ModalComponent) modal: ModalComponent;
}
