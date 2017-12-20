import { 
	Component, Input, ViewChild, 
	EventEmitter, Output, OnInit
} from '@angular/core';

import { QaGeneratorComponent } from './../qa-generator/qa-generator.component';
import { JiraCommentsComponent } from './../jira-comments/jira-comments.component';
import { StatusModalComponent } from './../status-modal/status-modal.component';
import { TimeLogComponent } from './../time-log/time-log.component';
import { SetPingsComponent } from './../set-pings/set-pings.component';

import { ToastrService } from './../services/toastr.service';
import { JiraService } from './../services/jira.service';
import { ConfigService } from './../services/config.service'
import { UserService } from './../services/user.service'


@Component({
	selector: '.appTicket',
	templateUrl: './ticket.component.html',
	styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {
	oldState; // old ticket state when changed
	ticketDropdown; // ticket dropdown reference
	ticketStates = [];

	constructor(
		public toastr: ToastrService, 
		public jira: JiraService, 
		public config: ConfigService, 
		public user: UserService
	) {}

	@Input() ticket;
	@Input() repos;
	@Output() rerender = new EventEmitter();

	@ViewChild(QaGeneratorComponent) public qaGen: QaGeneratorComponent;
	@ViewChild(JiraCommentsComponent) public jiraComments: JiraCommentsComponent;
	@ViewChild(StatusModalComponent) public statusModal: StatusModalComponent;
	@ViewChild(TimeLogComponent) public logWork: TimeLogComponent;
	@ViewChild(SetPingsComponent) public setPing: SetPingsComponent;

	ngOnInit(){

		// set valid transitions
		if(this.ticket.status === 'Ready for QA'){
			this.ticketStates = this.allTransistions.filter(state => ['In QA','In Development'].includes(state.name));
		
		} else if(this.ticket.status === 'PCR - Needed'){
			this.ticketStates = this.allTransistions.filter(state => ['In Development','PCR - Pass','PCR - Completed'].includes(state.name));
		
		} else if(this.ticket.status === 'In QA'){
			this.ticketStates = this.allTransistions.filter(state => ['In Development','QA Fail','QA Pass'].includes(state.name));
		
		} else if(this.ticket.status === 'In UCT'){
			this.ticketStates = this.allTransistions.filter(state => ['In Development','UCT Fail','UCT Pass'].includes(state.name));
		
		} else if(this.ticket.status === 'Ready for UCT'){
			this.ticketStates = this.allTransistions.filter(state => ['In Development','In UCT'].includes(state.name));
		
		} else if(this.ticket.status === 'In Development'){
			this.ticketStates = this.allTransistions.filter(state => ['PCR - Needed'].includes(state.name));

		} else if(['In Sprint','On Hold'].includes(this.ticket.status)){
			this.ticketStates = this.allTransistions.filter(state => ['In Development'].includes(state.name));
		
		} else if(['Ready for Release','Merge Code','Merge Conflict','Code Review - Working'].includes(this.ticket.status)){
			this.ticketStates = [];
		
		} else if(this.ticket.status === 'PCR - Completed'){
			this.ticketStates = this.allTransistions.filter(state => ['Code Review - Working'].includes(state.name));
		
		} else if(this.ticket.status === 'Code Review - Working'){
			this.ticketStates = this.allTransistions.filter(state => ['Ready for QA', 'Code Review - Fail'].includes(state.name));
		
		} else {
			this.ticketStates = this.allTransistions;
		}

		// if current status not in list of statues then add to beginning
		if( !(this.ticketStates.filter(state => state.name == this.ticket.status).length > 0)){
			this.ticketStates.unshift({name: this.ticket.status, id: ''});
		}
	}

	

	allTransistions = [
		{name: 'In Development', id: 'inDev'},
		{name: 'PCR - Needed', id: 'pcrNeeded'},
		{name: 'Remove PCR Needed', id: 'removePcrNeeded'},
		{name: 'PCR - Pass', id: 'pcrPass'},
		{name: 'PCR - Completed', id: 'pcrCompleted'},
		{name: 'Remove PCR Completed', id: 'removePcrCompleted'},
		{name: 'Code Review - Working', id: 'crWorking'},
		{name: 'Code Review - Fail', id: 'crFail'},
		{name: 'Ready for QA', id: 'qaReady'},
		{name: 'In QA', id: 'inQa'},
		{name: 'QA Fail', id: 'qaFail'},
		{name: 'QA Pass', id: 'qaPass'},
		{name: 'Merge Code', id: 'mergeCode'},
		{name: 'Merge Conflict', id: 'mergeConflict'},
		{name: 'In UCT', id: 'inUct'},
		{name: 'UCT Pass', id: 'uctPass'},
		{name: 'UCT Fail', id: 'uctFail'},
		{name: 'Ready for Release', id: 'releaseReady'}
	];

	/*
	*/
	stateChange(ticketDropdown){
		// save select element reference and old status
		this.ticketDropdown = ticketDropdown;
		this.oldState = this.ticket.component || this.ticket.status;

		if(ticketDropdown.value == 'pcrNeeded'){
			this.qaGen.openQAModal();
			return;
		}


		const ticketState = this.ticketStates.filter(state => state.id == ticketDropdown.value);

		if(ticketState.length == 0){
			this.toastr.showToast('Ticket status change not valid.','error');
			return;
		}

		this.statusModal.openStatusModal(ticketState[0].id, ticketState[0].name);
	}

	/*
	*/
	commentChangeEvent({newComment, response}):void {

		// if comment added the push comment onto comment array
		if(response && response.data.body){
			const newCommentBody = [{
				comment: response.data.body,
				created: response.data.created,
				id: response.data.id,
				updated: response.data.updated,
				username: this.user.username,
				display_name: this.user.userData.displayName,
				key: newComment.key,
				isEditing: false,
				closeText: 'Edit Comment',
				comment_type: 'info',
				editId: `E${response.data.id}`,
				email: this.user.userData.emailAddress,
				visibility: 'Developers'
			}];

			// merge comments to new array ref
			this.ticket.comments = [...this.ticket.comments, ...newCommentBody];

		} else if(newComment) {
			// else just replace comment ref to trigger change detection
			this.ticket.comments = newComment;
		}
	}

	/*
	*/
	statusChangeCancel(manualStatus?:string, showCancelMessage:boolean=true):void {
		// get id for current ticket's state and reset it on dropdown

		if(manualStatus){
			this.ticketDropdown.value = manualStatus;
		} else {
			const ticketState = this.ticketStates.filter(state => state.name == this.ticket.status);
			this.ticketDropdown.value = ticketState[0].id;
		}

		if(showCancelMessage){
			this.toastr.showToast(`Ticket status change cancelled for ${this.ticket.key}`, 'info');
		}
	}
}
