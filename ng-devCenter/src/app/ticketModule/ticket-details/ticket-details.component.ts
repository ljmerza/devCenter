import { Component, Input, ViewChild, ChangeDetectorRef, ElementRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService, ToastrService, JiraService } from '@services'
import { ModalComponent } from '@modal';

@Component({
	selector: 'dc-ticket-details',
	templateUrl: './ticket-details.component.html',
	styleUrls: ['./ticket-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class TicketDetailsComponent {
	loading:boolean = true;
	customModalCss = 'ticketDetails';

	@ViewChild(ModalComponent) modal: ModalComponent;
	modalRef: NgbModalRef;
	@Input() key;

	links = [];
	ticket;
	

	constructor(private toastr: ToastrService, public jira: JiraService, public config: ConfigService, private cd: ChangeDetectorRef) { }

	/**
	 * adds ticket details including any dependency links
	 * @param {Ticket} ticket
	 */
	processTicketDetails(ticket) {
		this.loading = false;
		this.ticket = ticket

		// sort by inward issues first
		this.links = ticket.links.sort(a => a.inwardIssue ? 1: 0);
		this.cd.detectChanges();
		
	}

	/**
	 * if ticket details don't exist then get them. Always open modal.
	 */
	openModel(){
		if(!this.ticket) this.getDetails();

		this.cd.detectChanges();
		this.modalRef = this.modal.openModal();
	}

	/**
	 * close the ticket details modal.
	 */
	closeModel(){
		this.modalRef.close();
	}

	/**
	 * gets a ticket's details.
	 */
	getDetails(){
		this.jira.getATicketDetails(this.key)
		.subscribe(
			tickets => {
				if(tickets && tickets.data && tickets.data.length === 1) {
					this.processTicketDetails(tickets.data[0]);
				}
			},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

}
