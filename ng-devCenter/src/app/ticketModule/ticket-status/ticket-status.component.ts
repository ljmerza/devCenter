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
import { STATUSES, Ticket, APIResponse } from '@models';

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
			this.crucibleId = allTickets.find(ticket => ticket.key === this.key).crucibleId;
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

		if(ticketDropdown.value == 'pcrNeeded'){
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
		if(['In Sprint','On Hold'].includes(this.ticketStatus)){
			this.ticketStates = this.allTransistions.filter(state => ['In Development'].includes(state.name));
		} else if(this.ticketStatus === 'In Development'){
			this.ticketStates = this.allTransistions.filter(state => ['PCR - Needed'].includes(state.name));
		
		} else if(this.ticketStatus === 'PCR - Needed'){
			this.ticketStates = this.allTransistions.filter(state => ['PCR - Pass','PCR - Completed'].includes(state.name));
		} else if(this.ticketStatus === 'PCR - Pass'){
			this.ticketStates = this.allTransistions.filter(state => ['PCR - Completed'].includes(state.name));
		} else if(this.ticketStatus === 'PCR - Completed'){
			this.ticketStates = this.allTransistions.filter(state => ['Code Review - Working'].includes(state.name));
		
		} else if(this.ticketStatus === 'Code Review - Working'){
			this.ticketStates = this.allTransistions.filter(state => ['Ready for QA', 'Code Review - Fail'].includes(state.name));
		} else if(this.ticketStatus === 'Code Review - Fail'){
			this.ticketStatus = 'In Development';
			this.ticketStates = this.allTransistions.filter(state => ['PCR - Needed'].includes(state.name));
		} else if(this.ticketStatus === 'Ready for QA'){
			this.ticketStates = this.allTransistions.filter(state => ['In QA'].includes(state.name));
		
		} else if(this.ticketStatus === 'In QA'){
			this.ticketStates = this.allTransistions.filter(state => ['QA Fail','QA Pass', 'Merge Conflict'].includes(state.name));
		} else if(this.ticketStatus === 'QA Fail'){
			this.ticketStatus = 'In Development';
			this.ticketStates = this.allTransistions.filter(state => ['PCR - Needed'].includes(state.name));
		} else if(this.ticketStatus === 'QA Pass'){
			this.ticketStatus = 'Merge Code';
			this.ticketStates = this.allTransistions.filter(state => ['Ready for UCT'].includes(state.name));
		
		} else if(this.ticketStatus === 'Ready for UCT'){
			this.ticketStates = this.allTransistions.filter(state => ['In UCT'].includes(state.name));
		} else if(this.ticketStatus === 'In UCT'){
			this.ticketStates = this.allTransistions.filter(state => ['UCT Fail','UCT Pass'].includes(state.name));
		} else if(this.ticketStatus === 'UCT Pass'){
			this.ticketStatus = 'Ready for Release';
			this.ticketStates = [];
		} else if(this.ticketStatus === 'UCT Fail'){
			this.ticketStatus = 'In Development';
			this.ticketStates = this.allTransistions.filter(state => ['PCR - Needed'].includes(state.name));

		} else if(this.ticketStatus === 'Merge Conflict'){
			this.ticketStates = this.allTransistions.filter(state => ['PCR - Needed', 'PCR - Completed', 'Ready for QA'].includes(state.name));
		} else if(this.ticketStatus === 'Merge Code'){
			this.ticketStates = this.allTransistions.filter(state => ['Ready for UCT'].includes(state.name));
		
		} else if(['Ready for Release'].includes(this.ticketStatus)){
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
		{name: 'Ready for UCT', id: 'uctReady'},
		{name: 'Ready for Release', id: 'releaseReady'}
	];

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
			this.changeStatus('pcrPass');
			this.changeStatus('pcrComplete');
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
