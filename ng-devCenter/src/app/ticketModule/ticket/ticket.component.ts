import { 
	Component, Input, ViewChild, ComponentFactoryResolver, ViewEncapsulation, 
	ViewContainerRef, ChangeDetectionStrategy 
} from '@angular/core';

import { TicketCommentsModalComponent } from './../../commentsModule/ticket-comments-modal/ticket-comments-modal.component';
import { WorkLogComponent } from './../work-log/work-log.component';
import { SetPingsComponent } from './../set-pings/set-pings.component';
import { TicketDetailsComponent } from './../ticket-details/ticket-details.component';
import { TicketStatusComponent } from './../ticket-status/ticket-status.component';
import { WatchersComponent } from './../watchers/watchers.component';

import { MiscService, ConfigService } from '@services';

@Component({
	selector: '.appTicket',
	templateUrl: './ticket.component.html',
	styleUrls: ['./ticket.component.scss'],
	entryComponents: [
		SetPingsComponent, TicketDetailsComponent,
		TicketCommentsModalComponent, WorkLogComponent
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None

})
export class TicketComponent {
	detailsComponentRef;
	pingComponentRef;
	commentComponentRef;
	worklogComponentRef;

	@Input() ticket;
	@ViewChild(TicketStatusComponent) ticketStatusRef: TicketStatusComponent;
	@ViewChild(WatchersComponent) watchersComponentRef: WatchersComponent;

	constructor(public config: ConfigService, private factoryResolver: ComponentFactoryResolver,
		private viewContRef: ViewContainerRef, public misc: MiscService
	) { }

	/**
	 * creates a ticket additional details modal if one doesn't exist then opens it
	 */
	openAdditionalDataModal(){
		if(!this.detailsComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(TicketDetailsComponent);
	    	this.detailsComponentRef = this.viewContRef.createComponent(factory);
	    	(<TicketDetailsComponent>this.detailsComponentRef.instance).key = this.ticket.key;
		}
    	this.detailsComponentRef.instance.openModel();
	}

	/**
	 * creates a ticket ping modal if one doesn't exist then opens it
	 */
	openPingModal() {
		if(!this.pingComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(SetPingsComponent);
	    	this.pingComponentRef = this.viewContRef.createComponent(factory);
	    	(<SetPingsComponent>this.pingComponentRef.instance).key = this.ticket.key;
	    	(<SetPingsComponent>this.pingComponentRef.instance).masterBranch = this.ticket.master_branch;
	    	(<SetPingsComponent>this.pingComponentRef.instance).branch = this.ticket.branch;
	    	(<SetPingsComponent>this.pingComponentRef.instance).commit = this.ticket.commit;
		}
    	(<SetPingsComponent>this.pingComponentRef.instance).modal.openModal();
	}

	/**
	 * creates a ticket comments modal if one doesn't exist then opens it
	 */
	openCommentsModal() {
		if(!this.commentComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(TicketCommentsModalComponent);
	    	this.commentComponentRef = this.viewContRef.createComponent(factory);
	    	(<TicketCommentsModalComponent>this.commentComponentRef.instance).key = this.ticket.key;
		}
    	(<TicketCommentsModalComponent>this.commentComponentRef.instance).modal.openModal();
	}

	/**
	 * creates a ticket log modal if one doesn't exist then opens it
	 */
	openLogModal() {
		if(!this.worklogComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(WorkLogComponent);
	    	this.worklogComponentRef = this.viewContRef.createComponent(factory);
	    	(<WorkLogComponent>this.worklogComponentRef.instance).key = this.ticket.key;
	    	(<WorkLogComponent>this.worklogComponentRef.instance).branch = this.ticket.branch;
	    	(<WorkLogComponent>this.worklogComponentRef.instance).masterBranch = this.ticket.master_branch;
	    	(<WorkLogComponent>this.worklogComponentRef.instance).commit = this.ticket.commit;
		}
    	(<WorkLogComponent>this.worklogComponentRef.instance).modal.openModal();
	}
}
