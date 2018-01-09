import { 
	Component, Input, ViewChild, ChangeDetectorRef,
	ElementRef, ChangeDetectionStrategy, ViewEncapsulation
} from '@angular/core';

import { ConfigService } from './../services/config.service'
import { ModalComponent } from './../modal/modal.component';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-ticket-details',
	templateUrl: './ticket-details.component.html',
	styleUrls: ['./ticket-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class TicketDetailsComponent {
	loading:boolean = true;

	// @Input() ticketDetails;
	@ViewChild(ModalComponent) modal: ModalComponent;
	modalRef: NgbModalRef;

	links = [];
	ticket;
	customModalCss = 'ticketDetails';

	constructor(public config: ConfigService, private cd: ChangeDetectorRef) { }

	@Input()
	set ticketDetails(ticket) {
		this.ticket = ticket;

		if(ticket) {
			this.loading = false;

			// sort by inward issues first
			this.links = ticket.links.sort( (a,b)=> {
				return a.inwardIssue ? 1: 0;
			});

			// need to manually trigger change detection
			this.cd.detectChanges();
		}	
	}

	/**
	*/
	openModel(){
		setTimeout( () => {
			this.modalRef = this.modal.openModal();
		});
	}

	/**
	*/
	closeModel(){
		this.modalRef.close();
	}

}
