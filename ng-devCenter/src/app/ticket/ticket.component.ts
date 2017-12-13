import { 
	Component, Input, ViewChild, 
	EventEmitter, Output,
	AfterViewInit
} from '@angular/core';

import { QaGeneratorComponent } from './../qa-generator/qa-generator.component';
import { JiraCommentsComponent } from './../jira-comments/jira-comments.component';
import { StatusModalComponent } from './../status-modal/status-modal.component';
import { TimeLogComponent } from './../time-log/time-log.component';
import { SetPingsComponent } from './../set-pings/set-pings.component';

import { ToastrService } from './../services/toastr.service';
import { JiraService } from './../services/jira.service';
import { ConfigService } from './../services/config.service'


@Component({
	selector: '.appTicket',
	templateUrl: './ticket.component.html',
	styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements AfterViewInit {
	oldState; // old ticket state when changed
	ticketDropdown; // ticket dropdown reference

	constructor(public toastr: ToastrService, public jira: JiraService, public config: ConfigService) {}

	@Input() ticket;
	@Input() repos;
	@Input() rerender = new EventEmitter();
	@ViewChild(QaGeneratorComponent) public qaGen: QaGeneratorComponent;
	@ViewChild(JiraCommentsComponent) public jiraComments: JiraCommentsComponent;
	@ViewChild(StatusModalComponent) public statusModal: StatusModalComponent;
	@ViewChild(TimeLogComponent) public logWork: TimeLogComponent;
	@ViewChild(SetPingsComponent) public setPing: SetPingsComponent;

	ngAfterViewInit(){

		// if current status not in list of statues then add to beginning
		if( !(this.ticketStates.filter(state => state.name == this.ticket.status).length > 0)){
			this.ticketStates.unshift({name: this.ticket.status, id: ''});
		}
	}

	ticketStates = [
		{name: 'In Development', id: 'inDev'},
		{name: 'PCR - Needed', id: 'pcrNeeded'},
		{name: 'PCR - Pass', id: 'pcrPass'},
		{name: 'PCR - Completed', id: 'pcrCompleted'},
		{name: 'In QA', id: 'inQa'},
		{name: 'QA Fail', id: 'qaFail'},
		{name: 'QA Pass', id: 'qaPass'},
		{name: 'Merge Code', id: 'mergeCode'},
		{name: 'Merge Conflict', id: 'mergeConflict'},
		{name: 'In UCT', id: 'inUct'},
		{name: 'UCT Pass', id: 'uctPass'},
		{name: 'UCT Fail', id: 'uctFail'}
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
	logTimeEvent(logTime):void {
		this.rerender.emit();
	}

	/*
	*/
	statusChangeCancel():void {
		// get id for current ticket's state and reset it on dropdown
		const ticketState = this.ticketStates.filter(state => state.name == this.ticket.status);
		this.ticketDropdown.value = ticketState[0].id;
		this.toastr.showToast(`Ticket status change cancelled for ${this.ticket.key}`, 'info');
	}
}
