import { 
	Component, Input, Output, ViewContainerRef, EventEmitter, ChangeDetectorRef, SimpleChanges,
	ComponentFactoryResolver, OnInit, ChangeDetectionStrategy, OnChanges, ViewChild, OnDestroy
} from '@angular/core';

import { select, NgRedux } from '@angular-redux/store';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { QaGeneratorComponent } from './../qa-generator/qa-generator.component';

import { ToastrService, JiraService } from '@services';
import { ModalComponent } from '@modal';
import { RootState, Actions } from '@store';
import { statuses, Ticket, APIResponse } from '@models';

@Component({
	selector: 'dc-ticket-status',
	templateUrl: './ticket-status.component.html',
	styleUrls: ['./ticket-status.component.scss'],
	entryComponents: [QaGeneratorComponent],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketStatusComponent implements OnInit, OnDestroy {
	ticketStates:Array<any> = [];

	ticketDropdown;
	qaComponentRef;
	statusComponentRef;

	status$;
	crucibleId$;

	statusType: string;
	statusName: string;
	modalRef: NgbModalRef;

	ticketStatus;
	crucibleId;

	@Input() key;
	@Input() msrp;
	@ViewChild(ModalComponent) modal: ModalComponent;

	constructor(
		private factoryResolver: ComponentFactoryResolver, private cd: ChangeDetectorRef, private store:NgRedux<RootState>,
		private viewContRef: ViewContainerRef, private toastr: ToastrService, private jira: JiraService
	) { }

	allTransistions = [
		{name: statuses.INDEV.frontend, id: statuses.INDEV.backend},
		{name: statuses.PCRNEED.frontend, id: statuses.PCRNEED.backend},
		{name: statuses.REMOVEPCR.frontend, id: statuses.REMOVEPCR.backend},
		{name: statuses.PCRPASS.frontend, id: statuses.PCRPASS.backend},
		{name: statuses.PCRCOMP.frontend, id: statuses.PCRCOMP.backend},
		{name: statuses.REMOVEPCRC.frontend, id: statuses.REMOVEPCRC.backend},
		{name: statuses.CRWORK.frontend, id: statuses.CRWORK.backend},
		{name: statuses.CRFAIL.frontend, id: statuses.CRFAIL.backend},
		{name: statuses.QAREADY.frontend, id: statuses.QAREADY.backend},
		{name: statuses.INQA.frontend, id: statuses.INQA.backend},
		{name: statuses.QAFAIL.frontend, id: statuses.QAFAIL.backend},
		{name: statuses.QAPASS.frontend, id: statuses.QAPASS.backend},
		{name: statuses.MERGECODE.frontend, id: statuses.MERGECODE.backend},
		{name: statuses.MERGECONF.frontend, id: statuses.MERGECONF.backend},
		{name: statuses.INUCT.frontend, id: statuses.INUCT.backend},
		{name: statuses.UCTPASS.frontend, id: statuses.UCTPASS.backend},
		{name: statuses.UCTFAIL.frontend, id: statuses.UCTFAIL.backend},
		{name: statuses.UCTREADY.frontend, id: statuses.UCTREADY.backend},
		{name: statuses.RELEASE.frontend, id: statuses.RELEASE.backend}
	];

	/**
	 * Watch for changes in the ticket's status in redux.
	 */
	ngOnInit() {
		this.status$ = this.store.select('statuses')
		.subscribe((allTickets:Array<any>) => {
			const ticket = this.ticketStatus = allTickets.find(ticket => ticket.key === this.key);
			if(ticket && this.ticketStatus !== ticket.status){
				this.ticketStatus = ticket.status;
				this.validateTransitions();
			}
			
		});

		this.crucibleId$ = this.store.select('crucibleIds')
		.subscribe((allTickets:Array<any>) => {
			const ticket = allTickets.find(ticket => ticket.key === this.key);
			if(ticket && this.crucibleId !== ticket.crucibleId){
				this.crucibleId = ticket.crucibleId;
				this.cd.detectChanges();
			}
		});
	}

	/**
	 * Unsubscribe from any subscriptions before component exit.
	 */
	ngOnDestroy(){
		if(this.status$) this.status$.unsubscribe();
		if(this.crucibleId$) this.crucibleId$.unsubscribe();
	}

	/**
	 *Checks for the type of ticket status change and triggers the QA generator or status modal.
	 * @param {} ticketDropdown
 	 */
	stateChange(ticketDropdown){
		// save select element reference and old status
		this.ticketDropdown = ticketDropdown;

		if(ticketDropdown.value == statuses.PCRNEED.backend){
			this.openQAModal();
		} else {
			this.openStatusModal(ticketDropdown);
		}	
	}

	/**
	 * updates or cancels a ticket's status and validates it's transitions.
	 * @param {boolean} cancelled
	 * @param {string} statusName
	 */
	statusChange({cancelled=true, statusName=''}):void {
		let ticketStateFilter;

		// if we are canceling a status then reset dropdown
		if(cancelled){
			ticketStateFilter = state => state.name == this.ticketStatus
		} else if(statusName) {
			// if given the status then set status at that
			ticketStateFilter = state => state.name == statusName;
		} else {
			// else set ticket state with new dropdown value and reload valid transitions
			ticketStateFilter = state => state.id == this.ticketDropdown.value;
		}

		const status = this.ticketStates.find(ticketStateFilter).name;
		this.store.dispatch({ type: Actions.updateStatus, payload: {key:this.key, status} });
	}

	/**
	 * Creates valid transitions array for status dropdown
	 */
	validateTransitions() {
		if([statuses.SPRINT.frontend,statuses.ONHOLD.frontend].includes(this.ticketStatus)){
			this.ticketStates = this.allTransistions.filter(state => [statuses.INDEV.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.INDEV.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.SPRINT.frontend,statuses.PCRNEED.frontend].includes(state.name));
		
		} else if(this.ticketStatus === statuses.PCRNEED.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.INDEV.frontend,statuses.PCRPASS.frontend,statuses.PCRCOMP.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.PCRPASS.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.PCRCOMP.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.PCRCOMP.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.CRWORK.frontend].includes(state.name));
		
		} else if(this.ticketStatus === statuses.CRWORK.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.PCRCOMP.frontend,statuses.QAREADY.frontend, statuses.CRFAIL.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.CRFAIL.frontend){
			this.ticketStatus = statuses.INDEV.frontend;
			this.ticketStates = this.allTransistions.filter(state => [statuses.PCRNEED.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.QAREADY.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.INQA.frontend].includes(state.name));
		
		} else if(this.ticketStatus === statuses.INQA.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.QAREADY.frontend,statuses.QAFAIL.frontend,statuses.QAPASS.frontend,statuses.MERGECONF.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.QAFAIL.frontend){
			this.ticketStatus = statuses.INDEV.frontend;
			this.ticketStates = this.allTransistions.filter(state => [statuses.PCRNEED.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.QAPASS.frontend){
			this.ticketStatus = statuses.MERGECODE.frontend;
			this.ticketStates = this.allTransistions.filter(state => [statuses.UCTREADY.frontend].includes(state.name));
		
		} else if(this.ticketStatus === statuses.UCTREADY.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.INUCT.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.INUCT.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.UCTREADY.frontend,statuses.UCTFAIL.frontend,statuses.UCTPASS.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.UCTPASS.frontend){
			this.ticketStatus = statuses.RELEASE.frontend;
			this.ticketStates = [];
		} else if(this.ticketStatus === statuses.UCTFAIL.frontend){
			this.ticketStatus = statuses.INDEV.frontend;
			this.ticketStates = this.allTransistions.filter(state => [statuses.PCRNEED.frontend].includes(state.name));

		} else if(this.ticketStatus ===statuses.MERGECONF.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.PCRNEED.frontend, statuses.PCRCOMP.frontend, statuses.QAREADY.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.MERGECODE.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.UCTREADY.frontend].includes(state.name));
		
		} else if([statuses.RELEASE.frontend].includes(this.ticketStatus)){
			this.ticketStates = [];
		} else {
			this.ticketStates = this.allTransistions;
		}

		// if current status not in list of statues then add to beginning
		if( !(this.ticketStates.find(state => state.name == this.ticketStatus) )){
			this.ticketStates.unshift({name: this.ticketStatus, id: ''});
		}

		this.cd.detectChanges();
	}

	/**
	 * Opens the QA generator modal if transitioning to PCR needed.
	 */
	openQAModal(){
		// create QA gen component if not created yet
		if(!this.qaComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(QaGeneratorComponent);
	    	this.qaComponentRef = this.viewContRef.createComponent(factory);

	    	// add input/outputs
	    	(<QaGeneratorComponent>this.qaComponentRef.instance).key = this.key;
	    	(<QaGeneratorComponent>this.qaComponentRef.instance).msrp = this.msrp;
		}
		
		// open modal
    	(<QaGeneratorComponent>this.qaComponentRef.instance).openQAModal();

	}

	/**
	 * opens the confirm status change modal.
	 * @param {HtmlElement} ticketDropdown the select element for the ticket status
	 */
	openStatusModal(ticketDropdown): void {
		const ticketState = this.ticketStates.find(state => state.id == ticketDropdown.value);

		// save transition data for modal then open model
		this.statusType = ticketState.id
		this.statusName = ticketState.name;
		this.modalRef = this.modal.openModal();

		// set dismiss event to trigger status cancel
		this.modalRef.result.then(
    		() => null,
    		() => {
    			this.statusChange({});
    			this.toastr.showToast(`Ticket status change cancelled for ${this.key}`, 'info');
    		}
    	)
	}

	/**
	 * close status change modal and trigger a status change if confirmed
	 * @param {boolean} submit do we submit a status change event?
	 */
	closeStatusModal(submit:boolean=false): void{
		if(submit){
			this.changeStatus(this.statusType);
		} else {
			this.toastr.showToast(`Ticket status change cancelled for ${this.key}`, 'info');
			this.statusChange({});
		}

		this.modalRef.close();	
	}

	/**
	 * Persists the status change to the backend
	 * @param {string} statusType the status type string
	 */
	changeStatus(statusType:string): void {
		this.jira.changeStatus({key:this.key, statusType, crucible_id: this.crucibleId})
		.subscribe(
			statusResponse => this.verifyStatusChangeSuccess(statusResponse.data, statusType),
			error => {
				this.jira.processErrorResponse(error);
				this.statusChange({});
				this.toastr.showToast(`Ticket status change cancelled for ${this.key}`, 'info');
			}
		);
	}

	/**
	 * verifies the ticket state changes were successful.
	 * @param {APIResponse} statusResponse the response object from the API call to change status
	 * @param {string} statusType the status type string
	 */
	verifyStatusChangeSuccess(statusResponse, statusType:string){
		// check QA pass
		if(statusType === statuses.QAPASS.backend){
			if( this.qaPassVerify(statusResponse) ) return;
		}

		this.statusChange({cancelled: false});
		this.toastr.showToast(`Status successfully changed for ${this.key}`, 'success');
	}

	/**
	 * Verifies QA pass comment and status transitions.
	 * @param {APIResponse} statusResponse the response object from the API call to change status
	 */
	 qaPassVerify(statusResponse):boolean{
	 	let message = [];

	 	// check for QA pass comment added
		if(statusResponse.comment_response.status){
			this.store.dispatch({ type: Actions.addComment, payload: statusResponse.comment_response.data });
		} else {
			message.push(`Failed to add comment: ${statusResponse.comment_response.data}`);
		}

		// check for status transitions
		if(statusResponse.qa_pass.status && statusResponse.merge_code.status){
			this.statusChange({cancelled: false});
		} else {
			if(!statusResponse.qa_pass.status) message.push(`Failed to transition to QA Pass: ${statusResponse.qa_pass.data}`);
			if(!statusResponse.merge_code.status) message.push(`Failed to transition to Merge Code: ${statusResponse.merge_code.data}`);
		}

		// show errors if they exist
		if(message.length > 0) this.toastr.showToast(message.join(', '), 'error');

		return message.length === 0;
	 }

}
