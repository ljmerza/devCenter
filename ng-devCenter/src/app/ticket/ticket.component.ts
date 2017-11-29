import { 
	Component, Input, ViewChild, 
	EventEmitter, Output, ViewContainerRef,
	AfterViewInit
} from '@angular/core';

import { QaGeneratorComponent } from './../qa-generator/qa-generator.component';
import { JiraCommentsComponent } from './../jira-comments/jira-comments.component';
import { PcrModalComponent } from './../pcr-modal/pcr-modal.component';
import { TimeLogComponent } from './../time-log/time-log.component';

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

	constructor(
		public toastr: ToastrService, 
		private vcr: ViewContainerRef, 
		public jira: JiraService, 
		public config: ConfigService
	) {
		this.toastr.toastr.setRootViewContainerRef(vcr);
	}

	@Input() ticket;
	@Input() repos;
	@Input() rerender = new EventEmitter();
	@ViewChild(QaGeneratorComponent) public qaGen: QaGeneratorComponent;
	@ViewChild(JiraCommentsComponent) public jiraComments: JiraCommentsComponent;
	@ViewChild(PcrModalComponent) public pcrModal: PcrModalComponent;
	@ViewChild(TimeLogComponent) public logWork: TimeLogComponent;

	ngAfterViewInit(){

		// if current status not in list of statues then add to beginning
		if( !this.ticketStates.includes(this.ticket.status) ){
			this.ticketStates.unshift(this.ticket.status);
		}
	}

	ticketStates = [
		'In Development',
		'PCR - Needed',
		'PCR - Pass',
		'PCR - Completed',
		'In QA',
		'QA Fail',
		'QA Pass',
		'In UCT',
		'Ready for Release',
	];

	/*
	*/
	stateChange(ticketDropdown){
		// save select element reference and old status
		this.ticketDropdown = ticketDropdown;
		this.oldState = this.ticket.component || this.ticket.status;


		// open status change dialog with right settings
		if(ticketDropdown.value == 'In Development'){
			this.pcrModal.openStatusModal('inDev');

		} else if(ticketDropdown.value == 'PCR - Needed'){
			this.qaGen.openQAModal();
			
		} else if(ticketDropdown.value == 'PCR - Pass'){
			ticketDropdown.value = 'PCR - Needed';
			this.pcrModal.openStatusModal('pass');

		} else if(ticketDropdown.value == 'PCR - Completed'){
			this.pcrModal.openStatusModal('complete');

		} else if(ticketDropdown.value == 'In QA'){
			this.pcrModal.openStatusModal('inQA');

		} else if(ticketDropdown.value == 'QA Pass'){
			this.pcrModal.openStatusModal('qaPass');

		} else if(ticketDropdown.value == 'QA Fail'){
			this.pcrModal.openStatusModal('qaFail');

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
	statusChangeEvent({cancel=false}):void {
		if(cancel) {
			this.ticketDropdown.value = this.oldState;
			this.toastr.showToast(`Ticket status change cancelled for ${this.ticket.key}`, 'info');
		}

		this.rerender.emit();
	}

}
