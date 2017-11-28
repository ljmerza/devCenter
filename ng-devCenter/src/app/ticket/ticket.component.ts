import { Component, Input, ViewChild, EventEmitter, Output, ViewContainerRef } from '@angular/core';

import { QaGeneratorComponent } from './../qa-generator/qa-generator.component';
import { JiraCommentsComponent } from './../jira-comments/jira-comments.component';
import { PcrModalComponent } from './../pcr-modal/pcr-modal.component';
import { TimeLogComponent } from './../time-log/time-log.component';

import { ToastrService } from './../services/toastr.service';
import { JiraService } from './../services/jira.service';


import config from '../services/config';


@Component({
	selector: '.appTicket',
	templateUrl: './ticket.component.html',
	styleUrls: ['./ticket.component.scss']
})
export class TicketComponent {
	config=config
	oldState; // old ticket state when changed
	ticketDropdown; // ticket dropdown reference

	constructor(public toastr: ToastrService, vcr: ViewContainerRef, public jira:JiraService) {
		this.toastr.toastr.setRootViewContainerRef(vcr);
	}

	@Input() ticket;
	@Input() repos;
	@Input() rerender = new EventEmitter();
	@ViewChild(QaGeneratorComponent) public qaGen: QaGeneratorComponent;
	@ViewChild(JiraCommentsComponent) public jiraComments: JiraCommentsComponent;
	@ViewChild(PcrModalComponent) public pcrModal: PcrModalComponent;
	@ViewChild(TimeLogComponent) public logWork: TimeLogComponent;

	
	ticketStates = [
		'Triage',
		'Backlog',
		'In Sprint',
		'In Development',
		'PCR - Needed',
		'PCR - Pass',
		'PCR - Completed',
		'Code Review - Working',
		'Ready for QA',
		'In QA',
		'QA Fail',
		'Merge Code',
		'Ready for UCT',
		'In UCT',
		'Ready for Release',
		'Closed',
		'On Hold'
	];

	/*
	*/
	stateChange(ticketDropdown){
		// save select element reference and old status
		this.ticketDropdown = ticketDropdown;
		this.oldState = this.ticket.component || this.ticket.status;

		// open QA gen
		if(ticketDropdown.value == 'PCR - Needed'){
			this.qaGen.openQAModal();

		} else if(ticketDropdown.value == 'PCR - Pass'){
			ticketDropdown.value = 'PCR - Needed';
			this.pcrModal.openPCRModal('pass');

		}  else if(ticketDropdown.value == 'PCR - Completed'){
			this.pcrModal.openPCRModal('complete');

		} else {
			this.ticketDropdown.value = this.oldState;
			this.toastr.showToast(`This status change has not been implemented.`, 'error');
		}
	}

	/*
	*/
	newCrucible({key, crucible_id='', changedStatus}):void {

		// if we changed status then save cru id and update ticket
		if(changedStatus) {
			this.ticket.crucible_id = crucible_id;
			this.rerender.emit();
			return;

		} else if (!crucible_id){
			// else if we didnt even get a cru id then we have an error
			this.toastr.showToast(`Ticket status change cancelled for ${key}`, 'info');
		}

		// revert state if not updating jira
		this.ticketDropdown.value = this.oldState;
	}

	/*
	*/
	logTimeEvent(logTime):void {
		this.rerender.emit();
	}

	/*
	*/
	pcrPassEvent({key, isTransitioned, showToast=true}):void {

		// if successful transition then reload table
		if(isTransitioned){
			this.rerender.emit();

		} else {
			// else revert status change
			this.ticketDropdown.value = this.oldState;
			if(showToast) {
				this.toastr.showToast(`Ticket status change cancelled for ${key}`, 'info');
			}
		}
	}

}
