import { 
	Component, Input, ViewChild, 
	ElementRef, ChangeDetectionStrategy
} from '@angular/core';

import { ConfigService } from './../services/config.service'

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-ticket-details',
	templateUrl: './ticket-details.component.html',
	styleUrls: ['./ticket-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketDetailsComponent {

	options: NgbModalOptions = {size: 'lg'}
	loading:boolean = true;

	// @Input() ticketDetails;
	@ViewChild('detailsModal') content: ElementRef;
	links = [];
	ticket;

	// on set of input sort links
	@Input()
	set ticketDetails(ticket) {
		this.ticket = ticket;

		if(ticket && ticket.links){
			this.loading = false

			// sort by inward issues first
			this.links = ticket.links.sort( (a,b)=> {
				return a.inwardIssue ? 1: 0;
			});
		}	
	}

	constructor(private modalService: NgbModal, public config: ConfigService) { }


	openDetailsModel(){
		this.modalService.open(this.content, this.options);
	}

}
