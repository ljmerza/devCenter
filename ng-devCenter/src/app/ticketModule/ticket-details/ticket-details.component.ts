import { Component, Input, ViewChild, ChangeDetectorRef, ElementRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { ConfigService, ToastrService, JiraService } from '@services'
import { ModalComponent } from '@modal';

@Component({
	selector: 'dc-ticket-details',
	templateUrl: './ticket-details.component.html',
	styleUrls: ['./ticket-details.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class TicketDetailsComponent {
	loading:boolean = true;
	@Input() key;

	links = [];
	ticket;

	ngOnInit(){
		this.getDetails();
	}
	

	constructor(private toastr: ToastrService, public jira: JiraService, public config: ConfigService) { }

	/**
	 * adds ticket details including any dependency links
	 * @param {Ticket} ticket
	 */
	processTicketDetails(ticket) {
		this.loading = false;
		this.ticket = ticket

		console.log({ticket});

		// sort by inward issues first
		this.links = ticket.links.sort(a => a.inwardIssue ? 1: 0);
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
