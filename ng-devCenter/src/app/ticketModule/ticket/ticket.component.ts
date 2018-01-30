import { 
	Component, Input, ViewChild, ComponentFactoryResolver, ViewEncapsulation,
	EventEmitter, Output, ViewContainerRef, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { TicketCommentsModalComponent } from './../../commentsModule/ticket-comments-modal/ticket-comments-modal.component';
import { TicketLogComponent } from './../ticket-log/ticket-log.component';
import { SetPingsComponent } from './../set-pings/set-pings.component';
import { TicketDetailsComponent } from './../ticket-details/ticket-details.component';
import { TicketStatusComponent } from './../ticket-status/ticket-status.component';

import { ToastrService } from './../../shared/services/toastr.service';
import { JiraService } from './../../shared/services/jira.service';
import { ConfigService } from './../../shared/services/config.service';
import { UserService } from './../../shared/services/user.service';
import { MiscService } from './../../shared/services/misc.service';


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

	constructor(
		private toastr: ToastrService, public jira: JiraService, public config: ConfigService, 
		public user: UserService, private factoryResolver: ComponentFactoryResolver, 
		private viewContRef: ViewContainerRef, public misc: MiscService, private cd: ChangeDetectorRef
	) { }

	@Input() ticket;
	@Input() repos;
	@Output() rerender = new EventEmitter();
	@ViewChild(TicketStatusComponent) ticketStatusRef: TicketStatusComponent;

	/**
	* @param allComments Comments array to replace all comments on this ticket.
	* @param newStatus Set the new status.
	* @param response New comment response from API. 
	*/
	commentChangeEvent({ allComments, newStatus, response }):void {
		// if comment added from API then push comment onto comment array
		if(response && ((response.data && response.data.comment) || response.comment)){

			// get new comment data
			const commentData = response.comment || response.data.comment;

			// create new comment object
			const newCommentBody = {
				comment: commentData.renderedBody,
				raw_comment: commentData.body,
				created: new Date(commentData.created),
				id: commentData.id,
				updated: new Date(commentData.updated),
				username: this.user.username,
				display_name: this.user.userData.displayName,
				key: this.ticket.key,
				isEditing: false,
				closeText: 'Edit Comment',
				comment_type: 'info',
				editId: `E${commentData.id}`,
				email: this.user.userData.emailAddress,
				visibility: 'Developers'
			};

			// if cruicible ID given then set on ticket
			if(response.data && response.data.crucible_id) {
				this.ticket.crucibleId = response.data.crucible_id;
			}

			// merge comments to new array ref
			this.ticket.comments = [...this.ticket.comments, newCommentBody];

		} else if(allComments) {
			// else just replace comment ref to trigger change detection
			this.ticket.comments = allComments;
		}
			
		// set new comments on comments component
		if(this.commentComponentRef){
			this.commentComponentRef.instance.comments = this.ticket.comments;
		}

		// check for status change
		if(newStatus){
			this.ticket.status = newStatus;
			this.cd.detectChanges();
		}
	}

	/**
	*/
	addReviewer(){

  		// change 'status' (add user to crucible then open crucible)
  		this.jira.changeStatus({key:this.ticket.key, statusType:'pcrAdd', crucible_id:this.ticket.crucible_id})
		.subscribe(
			() => {
				// open crucible if successfully joined
				let win = window.open(`${this.config.crucibleUrl}/cru/${this.ticket.crucible_id}`, '_blank');
		  		win.focus();
			},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

	/**
	*/
	openAdditionalDataModal(){

		// create modal if doesn't exist
		if(!this.detailsComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(TicketDetailsComponent);
	    	this.detailsComponentRef = this.viewContRef.createComponent(factory);
	    	(<TicketDetailsComponent>this.detailsComponentRef.instance).ticketDetails = this.ticketDetails;
		}

		// open modal
    	this.detailsComponentRef.instance.openModel();

		// load new or refresh ticket details
		this.jira.getATicketDetails(this.ticket.key)
		.subscribe(
			(issue:any) => {
				if(issue && Array.isArray(issue.data)){
					this.ticketDetails = issue.data[0];
					(<TicketDetailsComponent>this.detailsComponentRef.instance).ticketDetails = issue.data[0];
				}
				
			},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

	/**
	*/
	openPingModel() {
		// create modal if doesn't exist
		if(!this.pingComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(SetPingsComponent);
	    	this.pingComponentRef = this.viewContRef.createComponent(factory);
	    	(<SetPingsComponent>this.pingComponentRef.instance).key = this.ticket.key;
	    	(<SetPingsComponent>this.pingComponentRef.instance).sprint = this.ticket.sprint;
	    	(<SetPingsComponent>this.pingComponentRef.instance).branch = this.ticket.branch;
	    	(<SetPingsComponent>this.pingComponentRef.instance).commit = this.ticket.commit;
		}
		
		// open modal
    	(<SetPingsComponent>this.pingComponentRef.instance).openPingModel();
	}

	/**
	*/
	openModal() {
		// create modal if doesn't exist
		if(!this.commentComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(TicketCommentsModalComponent);
	    	this.commentComponentRef = this.viewContRef.createComponent(factory);

	    	// add inputs
	    	(<TicketCommentsModalComponent>this.commentComponentRef.instance).key = this.ticket.key;
	    	(<TicketCommentsModalComponent>this.commentComponentRef.instance).attachments = this.ticket.attachments;
	    	(<TicketCommentsModalComponent>this.commentComponentRef.instance).comments = this.ticket.comments;
	    	// add output event
	    	
	    	(<TicketCommentsModalComponent>this.commentComponentRef.instance)
	    		.commentChangeEvent.subscribe($event => this.commentChangeEvent($event));
		}
		
		// open modal on next event loop to allow inputs to settle
    	(<TicketCommentsModalComponent>this.commentComponentRef.instance).openModal();
	}

	/**
	*/
	openLogModal() {
		// create modal if doesn't exist
		if(!this.worklogComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(TicketLogComponent);
	    	this.worklogComponentRef = this.viewContRef.createComponent(factory);

	    	// add input/outputs
	    	(<TicketLogComponent>this.worklogComponentRef.instance).key = this.ticket.key;
	    	(<TicketLogComponent>this.worklogComponentRef.instance)
	    		.commentChangeEvent.subscribe($event => this.commentChangeEvent($event) );
	    	(<TicketLogComponent>this.worklogComponentRef.instance)
	    		.statusChangeCancel.subscribe($event => this.ticketStatusRef.statusChange($event) );
		}
		
		// open modal
    	(<TicketLogComponent>this.worklogComponentRef.instance).openLogModal();
	}
}
