import { 
	Component, Input, ViewChild, 
	ElementRef, ChangeDetectionStrategy,
	OnChanges, SimpleChanges
} from '@angular/core';

import { ConfigService } from './../services/config.service'

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-ticket-details',
	templateUrl: './ticket-details.component.html',
	styleUrls: ['./ticket-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketDetailsComponent implements OnChanges{

	options: NgbModalOptions = {size: 'lg'}
	loading:boolean = true;

	@Input() ticketDetails;
	@ViewChild('detailsModal') content: ElementRef;
	links = [];

	constructor(private modalService: NgbModal, public config: ConfigService) { }

	/*
	*/
	ngOnChanges(changes: SimpleChanges) {

		// if we have link values finally then we need to sort them
		if(changes.ticketDetails.currentValue && changes.ticketDetails.currentValue.links.length > 0){
			this.loading = false

			this.links = changes.ticketDetails.currentValue.links.sort( (a,b)=> {
				return a.inwardIssue ? 1: 0;
			});
		}
	}

	openDetailsModel(){
		this.modalService.open(this.content, this.options)
	}

}
