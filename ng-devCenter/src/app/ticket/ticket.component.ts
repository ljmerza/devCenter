import { 
	Component, Input, ViewChild, ComponentFactoryResolver,
	EventEmitter, Output, ViewContainerRef, ChangeDetectionStrategy
} from '@angular/core';

import { JiraCommentsComponent } from './../jira-comments/jira-comments.component';
import { TimeLogComponent } from './../time-log/time-log.component';
import { SetPingsComponent } from './../set-pings/set-pings.component';
import { TicketDetailsComponent } from './../ticket-details/ticket-details.component';
import { TicketStatusComponent } from './../ticket-status/ticket-status.component';

import { ToastrService } from './../services/toastr.service';
import { JiraService } from './../services/jira.service';
import { ConfigService } from './../services/config.service'
import { UserService } from './../services/user.service'


@Component({
	selector: '.appTicket',
	templateUrl: './ticket.component.html',
	styleUrls: ['./ticket.component.scss'],
	entryComponents: [
		SetPingsComponent, TicketDetailsComponent,
		JiraCommentsComponent, TimeLogComponent
	],
	changeDetection: ChangeDetectionStrategy.OnPush
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
		private viewContRef: ViewContainerRef
	) { }

	@Input() ticket;
	@Input() repos;
	@Output() rerender = new EventEmitter();
	@ViewChild(TicketStatusComponent) ticketStatusRef: TicketStatusComponent;

	/**
	*/
	commentChangeEvent({allComments, postData, newComment, response}):void {

		// if comment added the push comment onto comment array
		if(postData && postData.comment){
			const newCommentBody = [{
				comment: response.data.body,
				created: response.data.created,
				id: response.data.id,
				updated: response.data.updated,
				username: this.user.username,
				display_name: this.user.userData.displayName,
				key: postData.key,
				isEditing: false,
				closeText: 'Edit Comment',
				comment_type: 'info',
				editId: `E${response.data.id}`,
				email: this.user.userData.emailAddress,
				visibility: 'Developers'
			}];

			// merge comments to new array ref
			this.ticket.comments = [...this.ticket.comments, ...newCommentBody];

		} else if(allComments) {
			// else just replace comment ref to trigger change detection
			this.ticket.comments = allComments;
		}

		// check for removal of components
		if(postData && postData.remove_merge){
			this.ticket.status = 'Ready for UCT';
		} else if(postData && postData.remove_conflict){
			this.ticket.status = 'Ready for QA';
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
    	this.detailsComponentRef.instance.openDetailsModel();

		// load new or refresh ticket details
		this.jira.getATicketDetails(this.ticket.key)
		.subscribe(
			issue => {
				this.ticketDetails = issue.data[0];
				(<TicketDetailsComponent>this.detailsComponentRef.instance).ticketDetails = issue.data[0];
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
    	this.pingComponentRef.instance.openPingModel();
	}

	/**
	*/
	openCommentModal() {
		// create modal if doesn't exist
		if(!this.commentComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(JiraCommentsComponent);
	    	this.commentComponentRef = this.viewContRef.createComponent(factory);
	    	// add inputs
	    	(<JiraCommentsComponent>this.commentComponentRef.instance).key = this.ticket.key;
	    	(<JiraCommentsComponent>this.commentComponentRef.instance).attachments = this.ticket.attachments;
	    	(<JiraCommentsComponent>this.commentComponentRef.instance).comments = this.ticket.comments;
	    	// add output event
	    	(<JiraCommentsComponent>this.commentComponentRef.instance)
	    		.commentChangeEvent.subscribe($event => this.commentChangeEvent($event));
		}
		
		// open modal
    	(<JiraCommentsComponent>this.commentComponentRef.instance).openCommentModal();
	}

	/**
	*/
	openLogModal() {
		// create modal if doesn't exist
		if(!this.worklogComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(TimeLogComponent);
	    	this.worklogComponentRef = this.viewContRef.createComponent(factory);

	    	// add input/outputs
	    	(<TimeLogComponent>this.worklogComponentRef.instance).key = this.ticket.key;
	    	(<TimeLogComponent>this.worklogComponentRef.instance)
	    		.commentChangeEvent.subscribe($event => this.commentChangeEvent($event) );
	    	(<TimeLogComponent>this.worklogComponentRef.instance)
	    		.statusChangeCancel.subscribe($event => this.ticketStatusRef.statusChange($event) );
		}
		
		// open modal
    	(<TimeLogComponent>this.worklogComponentRef.instance).openLogModal();
	}
}
