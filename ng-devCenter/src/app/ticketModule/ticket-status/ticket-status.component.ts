import { 
	Component, Input, Output, ViewContainerRef, EventEmitter, ChangeDetectorRef, SimpleChanges,
	ComponentFactoryResolver, OnInit, ChangeDetectionStrategy, OnChanges, ViewChild
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
export class TicketStatusComponent implements OnInit {
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
			this.ticketStatus = allTickets.find(ticket => ticket.key === this.key).status;
			this.validateTransitions();
			this.cd.detectChanges();
		});

		this.crucibleId$ = this.store.select('crucibleIds')
		.subscribe((allTickets:Array<any>) => {
			const ticket = allTickets.find(ticket => ticket.key === this.key);
			if(ticket){
				this.crucibleId = ticket.crucibleId;
				this.cd.detectChanges();
			}
		});
	}

	/**
	 * Unsubscribe from any subscriptions before component exit.
	 */
	ngOnDestory(){
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
	*/
	validateTransitions() {
		if([statuses.SPRINT.frontend,statuses.ONHOLD.frontend].includes(this.ticketStatus)){
			this.ticketStates = this.allTransistions.filter(state => [statuses.INDEV.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.INDEV.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.PCRNEED.frontend].includes(state.name));
		
		} else if(this.ticketStatus === statuses.PCRNEED.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.PCRPASS.frontend,statuses.PCRCOMP.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.PCRPASS.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.PCRCOMP.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.PCRCOMP.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.CRWORK.frontend].includes(state.name));
		
		} else if(this.ticketStatus === statuses.CRWORK.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.QAREADY.frontend, statuses.CRFAIL.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.CRFAIL.frontend){
			this.ticketStatus = statuses.INDEV.frontend;
			this.ticketStates = this.allTransistions.filter(state => [statuses.PCRNEED.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.QAREADY.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.INQA.frontend].includes(state.name));
		
		} else if(this.ticketStatus === statuses.INQA.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.QAFAIL.frontend,statuses.QAPASS.frontend,statuses.MERGECONF.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.QAFAIL.frontend){
			this.ticketStatus = statuses.INDEV.frontend;
			this.ticketStates = this.allTransistions.filter(state => [statuses.PCRNEED.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.QAPASS.frontend){
			this.ticketStatus = statuses.MERGECODE.frontend;
			this.ticketStates = this.allTransistions.filter(state => [statuses.UCTREADY.frontend].includes(state.name));
		
		} else if(this.ticketStatus === statuses.UCTREADY.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.INUCT.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.INUCT.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.UCTFAIL.frontend,statuses.UCTPASS.frontend].includes(state.name));
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

		if(submit && this.statusType === 'complete'){
			this.changeStatus(statuses.PCRPASS.backend);
			this.changeStatus(statuses.PCRCOMP.backend);
		} else if(submit){
			this.changeStatus(this.statusType);
		} else {
			this.toastr.showToast(`Ticket status change cancelled for ${this.key}`, 'info');
			this.statusChange({});
		}

		this.modalRef.close();	
	}

	/**
	*/
	changeStatus(statusType:string): void {
		this.jira.changeStatus({key:this.key, statusType, crucible_id: this.crucibleId})
		.subscribe(
			() => {
				this.toastr.showToast(`Status successfully changed for ${this.key}`, 'success');
				this.statusChange({cancelled: false});
			},
			error => {
				this.jira.processErrorResponse(error);
				this.statusChange({});
				this.toastr.showToast(`Ticket status change cancelled for ${this.key}`, 'info');
			}
		);
	}

}
