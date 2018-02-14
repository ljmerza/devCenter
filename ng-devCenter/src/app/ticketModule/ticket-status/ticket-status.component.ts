import { 
	Component, Input, Output, ViewContainerRef, EventEmitter, ChangeDetectorRef,
	ComponentFactoryResolver, OnInit, ChangeDetectionStrategy, OnChanges
} from '@angular/core';

import { QaGeneratorComponent } from './../qa-generator/qa-generator.component';
import { StatusModalComponent } from './../status-modal/status-modal.component';
import { ToastrService } from './../../shared/services/toastr.service';

@Component({
	selector: 'dc-ticket-status',
	templateUrl: './ticket-status.component.html',
	styleUrls: ['./ticket-status.component.scss'],
	entryComponents: [StatusModalComponent, QaGeneratorComponent],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketStatusComponent implements OnInit, OnChanges {
	ticketStates = [];
	ticketDropdown;
	qaComponentRef;
	statusComponentRef;

	@Input() ticketStatus;
	@Input() ticketKey;
	@Input() ticketMsrp;
	@Input() ticketCrucible;
	@Input() repos;

	ngOnInit() {
		this.validateTransitions();
	}

	constructor(
		private factoryResolver: ComponentFactoryResolver, private cd: ChangeDetectorRef,
		private viewContRef: ViewContainerRef, private toastr: ToastrService
	) { }

	/**
	*/
	ngOnChanges(changes){
		const status = changes.ticketStatus;
		if(status && status.currentValue != status.previousValue){
			this.cd.detectChanges();
			this.validateTransitions();
		}
	}

	/*
	*/
	stateChange(ticketDropdown){
		// save select element reference and old status
		this.ticketDropdown = ticketDropdown;

		// if pcr needed - create QA gen if needed then open QA gen
		if(ticketDropdown.value == 'pcrNeeded'){

			this.openQAModal();
		} else {
			this.openStatusModal(ticketDropdown);
		}	
	}

	statusChange({showMessage=true, cancelled=true, statusName=''}):void {

		// if we are canceling a status then reset dropdown
		if(cancelled){
			const ticketState = this.ticketStates.filter(state => state.name == this.ticketStatus);
			this.ticketDropdown.value = ticketState[0].id;
			
		} else if(statusName) {
			// if given the status then set status at that
			const ticketState = this.allTransistions.filter(state => state.name == statusName);
			this.ticketStatus = ticketState[0].name;

		} else {
			// else set ticket state with new dropdown value and reload valid transitions
			const ticketState = this.allTransistions.filter(state => state.id == this.ticketDropdown.value);
			this.ticketStatus = ticketState[0].name;
		}

		this.validateTransitions();

		if(showMessage){
			this.toastr.showToast(`Ticket status change cancelled for ${this.ticketKey}`, 'info');
		}
	}

	/**
	*/
	validateTransitions() {

		// set valid transitions
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
		if( !(this.ticketStates.filter(state => state.name == this.ticketStatus).length > 0)){
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
	openStatusModal(ticketDropdown){
		// get ticket state info and open status modal
		const ticketState = this.ticketStates.filter(state => state.id == ticketDropdown.value);

		// create QA gen component if not created yet
		if(!this.statusComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(StatusModalComponent);
	    	this.statusComponentRef = this.viewContRef.createComponent(factory);

	    	// add input/outputs
	    	(<StatusModalComponent>this.statusComponentRef.instance).key = this.ticketKey;
	    	(<StatusModalComponent>this.statusComponentRef.instance).crucible_id = this.ticketCrucible;
	    	(<StatusModalComponent>this.statusComponentRef.instance)
	    		.statusChange.subscribe($event => this.statusChange($event));
		}
		
		// open modal
    	(<StatusModalComponent>this.statusComponentRef.instance).openStatusModal(ticketState[0].id, ticketState[0].name);
	}

	/**
	*/
	openQAModal(){
		// create QA gen component if not created yet
		if(!this.qaComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(QaGeneratorComponent);
	    	this.qaComponentRef = this.viewContRef.createComponent(factory);

	    	// add input/outputs
	    	(<QaGeneratorComponent>this.qaComponentRef.instance).key = this.ticketKey;
	    	(<QaGeneratorComponent>this.qaComponentRef.instance).repos = this.repos;
	    	(<QaGeneratorComponent>this.qaComponentRef.instance).msrp = this.ticketMsrp;
		}
		
		// open modal
    	(<QaGeneratorComponent>this.qaComponentRef.instance).openQAModal();

	}

}
