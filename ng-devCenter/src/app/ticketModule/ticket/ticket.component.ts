import { 
	Component, Input, ViewChild, ComponentFactoryResolver, ViewEncapsulation, OnInit, OnDestroy,
	EventEmitter, Output, ViewContainerRef, ChangeDetectionStrategy, ChangeDetectorRef 
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TicketCommentsModalComponent } from './../../commentsModule/ticket-comments-modal/ticket-comments-modal.component';
import { TicketLogComponent } from './../ticket-log/ticket-log.component';
import { SetPingsComponent } from './../set-pings/set-pings.component';
import { TicketDetailsComponent } from './../ticket-details/ticket-details.component';
import { TicketStatusComponent } from './../ticket-status/ticket-status.component';
import { WatchersComponent } from './../watchers/watchers.component';

import { MiscService, UserService, ConfigService, JiraService, ToastrService } from '@services';

import { Subject, Observable, Subscription } from 'rxjs';
import { NgRedux } from '@angular-redux/store';

import { Actions, RootState } from '@store';
import { Comment, Ticket, Attachment } from '@models';

@Component({
	selector: '.appTicket',
	templateUrl: './ticket.component.html',
	styleUrls: ['./ticket.component.scss'],
	entryComponents: [
		SetPingsComponent, TicketDetailsComponent,
		TicketCommentsModalComponent, TicketLogComponent
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None

})
export class TicketComponent {
	ticketDropdown; // ticket dropdown reference

	ticketDetails;
	detailsComponentRef;
	pingComponentRef;
	commentComponentRef;
	worklogComponentRef;

	@Input() ticket;
	@Output() rerender = new EventEmitter();

	ticketDates;

	@ViewChild(TicketStatusComponent) ticketStatusRef: TicketStatusComponent;
	@ViewChild(WatchersComponent) watchersComponentRef: WatchersComponent;

	constructor(
		private toastr: ToastrService, public jira: JiraService, public config: ConfigService, public route:ActivatedRoute,
		public user: UserService, private factoryResolver: ComponentFactoryResolver, public store:NgRedux<RootState>,
		private viewContRef: ViewContainerRef, public misc: MiscService, private cd: ChangeDetectorRef
	) { }

	init(){
		console.log('ticket: ', this.ticket);
	}

	/**
	*/
	openAdditionalDataModal(){
		if(!this.detailsComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(TicketDetailsComponent);
	    	this.detailsComponentRef = this.viewContRef.createComponent(factory);
	    	(<TicketDetailsComponent>this.detailsComponentRef.instance).key = this.ticket.key;
		}

		// open modal
    	this.detailsComponentRef.instance.openModel();
	}

	/**
	*/
	openPingModel() {
		if(!this.pingComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(SetPingsComponent);
	    	this.pingComponentRef = this.viewContRef.createComponent(factory);
	    	(<SetPingsComponent>this.pingComponentRef.instance).key = this.ticket.key;
	    	(<SetPingsComponent>this.pingComponentRef.instance).sprint = this.ticket.sprint;
	    	(<SetPingsComponent>this.pingComponentRef.instance).branch = this.ticket.branch;
	    	(<SetPingsComponent>this.pingComponentRef.instance).commit = this.ticket.commit;
		}
    	(<SetPingsComponent>this.pingComponentRef.instance).openPingModel();
	}

	/**
	*/
	openModal() {
		if(!this.commentComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(TicketCommentsModalComponent);
	    	this.commentComponentRef = this.viewContRef.createComponent(factory);
	    	(<TicketCommentsModalComponent>this.commentComponentRef.instance).key = this.ticket.key;
		}
    	(<TicketCommentsModalComponent>this.commentComponentRef.instance).openModal();
	}

	/**
	*/
	openLogModal() {
		if(!this.worklogComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(TicketLogComponent);
	    	this.worklogComponentRef = this.viewContRef.createComponent(factory);
	    	(<TicketLogComponent>this.worklogComponentRef.instance).key = this.ticket.key;
		}
    	(<TicketLogComponent>this.worklogComponentRef.instance).openLogModal();
	}
}
