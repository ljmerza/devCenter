import { Component, Input, Output, EventEmitter, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';

import { TicketCommentsModalComponent } from './../../commentsModule/ticket-comments-modal/ticket-comments-modal.component';
import { WorkLogComponent } from './../work-log/work-log.component';
import { SetPingsComponent } from './../set-pings/set-pings.component';
import { TicketStatusComponent } from './../ticket-status/ticket-status.component';

@Component({
	selector: 'dc-actions',
	templateUrl: './actions.component.html',
	styleUrls: ['./actions.component.scss'],
	entryComponents: [
		SetPingsComponent,
		TicketCommentsModalComponent, WorkLogComponent
	]
})
export class ActionsComponent {
	pingComponentRef = [];
	commentComponentRef = [];
	worklogComponentRef = [];

	@Input() ticket;
	@Output() expandRow = new EventEmitter();

	constructor(private factoryResolver: ComponentFactoryResolver, private viewContRef: ViewContainerRef) {}

	toggleExpandRow(ticket){
		this.expandRow.emit({ticket});
	}

	/**
	 * creates a ticket ping modal if one doesn't exist then opens it
	 */
	openPingModal(ticket) {
		let matchingRef = this.pingComponentRef.find(ref => ref.key === ticket.key);

		if(!matchingRef){
			const factory = this.factoryResolver.resolveComponentFactory(SetPingsComponent);
	    	matchingRef = {component: this.viewContRef.createComponent(factory), key: ticket.key};
	    	(<SetPingsComponent>matchingRef.component.instance).key = ticket.key;
	    	(<SetPingsComponent>matchingRef.component.instance).masterBranch = ticket.master_branch;
	    	(<SetPingsComponent>matchingRef.component.instance).branch = ticket.branch;
	    	(<SetPingsComponent>matchingRef.component.instance).commit = ticket.commit;
	    	this.pingComponentRef.push(matchingRef);
	    }

    	(<SetPingsComponent>matchingRef.component.instance).openModal();
    }


	/**
	 * creates a ticket comments modal if one doesn't exist then opens it
	 */
	openCommentsModal(ticket) {
		let matchingRef = this.commentComponentRef.find(ref => ref.key === ticket.key);

		if(!matchingRef){
			const factory = this.factoryResolver.resolveComponentFactory(TicketCommentsModalComponent);
    		matchingRef = {component: this.viewContRef.createComponent(factory), key: ticket.key};
    		(<TicketCommentsModalComponent>matchingRef.component.instance).key = ticket.key;
    		this.commentComponentRef.push(matchingRef);
    	}

    	(<TicketCommentsModalComponent>matchingRef.component.instance).openModal();
	}

	/**
	 * creates a ticket log modal if one doesn't exist then opens it
	 */
	openLogModal(ticket) {
		let matchingRef = this.worklogComponentRef.find(ref => ref.key === ticket.key);

		if(!matchingRef){
			const factory = this.factoryResolver.resolveComponentFactory(WorkLogComponent);
	    	matchingRef = {component: this.viewContRef.createComponent(factory), key: ticket.key};
	    	(<WorkLogComponent>matchingRef.component.instance).key = ticket.key;
	    	(<WorkLogComponent>matchingRef.component.instance).branch = ticket.branch;
	    	(<WorkLogComponent>matchingRef.component.instance).masterBranch = ticket.master_branch;
	    	(<WorkLogComponent>matchingRef.component.instance).commit = ticket.commit;
	    	this.worklogComponentRef.push(matchingRef);
		}

    	(<WorkLogComponent>matchingRef.component.instance).openModal();
	}
}
