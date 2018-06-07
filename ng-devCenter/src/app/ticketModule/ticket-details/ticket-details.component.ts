import { Component, Input, ViewChild, ChangeDetectorRef, ElementRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
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
	modalSize = 'medium';

	@ViewChild(ModalComponent) modal: ModalComponent;
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
	 * Always get ticket details when opening modal
	 */
	openModel(){
		this.getDetails();
		this.cd.detectChanges();
		this.modal.openModal();
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
