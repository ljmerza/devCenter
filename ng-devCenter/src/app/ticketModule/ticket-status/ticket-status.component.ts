import { 
	Component, Input, Output, ViewContainerRef, EventEmitter, ChangeDetectorRef, SimpleChanges,
	ComponentFactoryResolver, OnInit, ChangeDetectionStrategy, OnChanges, ViewChild, OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { select, NgRedux } from '@angular-redux/store';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { QaGeneratorComponent } from './../qa-generator/qa-generator.component';

import { ToastrService, JiraService } from '@services';
import { ModalComponent } from '@modal';
import { RootState, Actions } from '@store';
import { statuses, Ticket, APIResponse, allTransistions} from '@models';

@Component({
	selector: 'dc-ticket-status',
	templateUrl: './ticket-status.component.html',
	styleUrls: ['./ticket-status.component.scss'],
	entryComponents: [QaGeneratorComponent],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketStatusComponent implements OnInit, OnDestroy {
	ticketStates:Array<any> = [];
	ticketListType;

	ticketDropdown;
	qaComponentRef;
	statusComponentRef;

	statusType: string;
	statusName: string;

	ticketStatus;
	msrp;
	master_branch;

	status$
	allTransistions;

	pullRequests$;
	pullRequests;

	@Input() key;
	@ViewChild(ModalComponent) modal: ModalComponent;

	constructor(
		private factoryResolver: ComponentFactoryResolver, private cd: ChangeDetectorRef, private store:NgRedux<RootState>,
		private viewContRef: ViewContainerRef, private toastr: ToastrService, private jira: JiraService, 
		public route:ActivatedRoute
	) {
		this.allTransistions = allTransistions;
	}

	/**
	 * watch for changes to comments in store
	 */
	ngOnInit() {
		this.route.paramMap.subscribe((routeResponse:any) => {
			this.ticketListType = routeResponse.params.filter || 'mytickets';

			// get ticket status
			this.status$ = this.store.select(`${this.ticketListType}_statuses`)
			.subscribe((allTickets:Array<Ticket>=[]) => {
				const ticket:any = allTickets.find(ticket => ticket.key === this.key) || {};
				
				this.ticketStatus = ticket.status;
				this.msrp = ticket.msrp;
				this.master_branch = ticket.master_branch;
				this.validateTransitions();
			});

			// get ticket pull requests
			this.pullRequests$ = this.store.select(`${this.ticketListType}_codeCloud`)
			.subscribe((allTickets:any=[]) => {
				const ticket = allTickets.find(ticket => ticket.key === this.key) || {};
				this.pullRequests = ticket.pullRequests || '';
			});
		});
	}

	/**
	 *
	 */
	ngOnDestroy(){
		if(this.status$) this.status$.unsubscribe();
		if(this.pullRequests$) this.pullRequests$.unsubscribe();
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

		} else if(ticketDropdown.value == statuses.QAGEN.backend) {
			this.openQAModal(true);
		} else {
			this.openModal(ticketDropdown);
		}	
	}

	/**
	 * updates or cancels a ticket's status and validates it's transitions.
	 * @param {boolean} canceled
	 * @param {string} statusName
	 */
	statusChange({canceled, statusName='', hideToast=false}):void {
		let ticketStateFilter;

		// change state to canceled, custom state, or previous dropdown state
		if(canceled){
			ticketStateFilter = state => state.name == this.ticketStatus;
		} else if(statusName) {
			ticketStateFilter = state => state.name == statusName;
		} else {
			ticketStateFilter = state => state.id == this.ticketDropdown.value;
		}

		// update store
		const status = (this.ticketStates.find(ticketStateFilter) as any).name;
		this.store.dispatch({ type: Actions.updateStatus, payload: {key:this.key, status} });

		if(canceled && !hideToast){
			this.showCancelStatus();
		}
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
			this.ticketStates = this.allTransistions.filter(state => [statuses.INDEV.frontend,statuses.PCRWORK.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.PCRWORK.frontend){
			this.ticketStates = this.allTransistions.filter(state => [statuses.PCRPASS.frontend,statuses.PCRCOMP.frontend].includes(state.name));
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

		// always allow to generate crucible
		this.ticketStates.push(this.allTransistions.find(state => state.name === statuses.QAGEN.frontend));
		this.cd.markForCheck();
	}

	/**
	 * Opens the QA generator modal if transitioning to PCR needed.
	 */
	openQAModal(crucibleOnly=false){

		// create QA gen component if not created yet
		if(!this.qaComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(QaGeneratorComponent);
	    	this.qaComponentRef = this.viewContRef.createComponent(factory);

	    	(<QaGeneratorComponent>this.qaComponentRef.instance).key = this.key;
	    	(<QaGeneratorComponent>this.qaComponentRef.instance).msrp = this.msrp;
	    	(<QaGeneratorComponent>this.qaComponentRef.instance).statusChange.subscribe(this.statusChange.bind(this));
		}
		
		// open modal
    	(<QaGeneratorComponent>this.qaComponentRef.instance).crucibleOnly = crucibleOnly;
    	(<QaGeneratorComponent>this.qaComponentRef.instance).openQAModal();

	}

	/**
	 * opens the confirm status change modal.
	 * @param {HtmlElement} ticketDropdown the select element for the ticket status
	 */
	openModal(ticketDropdown): void {
		const ticketState = this.ticketStates.find(state => state.id == ticketDropdown.value);

		// save transition data for modal then open model
		this.statusType = ticketState.id
		this.statusName = ticketState.name;
		this.modal.openModal();
	}

	/**
	 * show ticket status canceled message
	 */
	showCancelStatus(){
		this.toastr.showToast(`Ticket status change canceled for ${this.key}`, 'info');
	}

	/**
	 * close status change modal and trigger a status change if confirmed
	 * @param {boolean} submit do we submit a status change event?
	 */
	closeModal(submit:boolean=false): void{
		this.modal.closeModal();
		
		if(submit){
			this.persistStatusChange(this.statusType);
		} else {
			this.statusChange({canceled:true});
		}
	}

	/**
	 * Persists the status change to the backend
	 * @param {string} statusType the status type string
	 */
	persistStatusChange(statusType:string): void {
		let postData:any = {key:this.key, statusType, pullRequests: this.pullRequests};

		// if transitioning from merge code to uct ready then add commit hash Jira comment
		if(statusType === statuses.UCTREADY.backend && this.ticketStatus === statuses.MERGECODE.frontend){
			postData.add_commits = true;
			postData.master_branch = this.master_branch;
			this.toastr.showToast(`Removing Merge Code component and adding commit hash Jira comment to ${this.key}`, 'info');
		}

		this.jira.changeStatus(postData)
		.subscribe(
			statusResponse => {
				this.verifyStatusChangeSuccess(statusResponse.data, statusType);

				// add log if commit hash comment was success
				if(postData.add_commits && statusResponse.status){
					this.toastr.showToast(`Added commit hash comment to ${this.key}`, 'success');
					this.store.dispatch({type: Actions.addComment, payload: statusResponse.data});
				}
			},
			error => {
				this.jira.processErrorResponse(error);
				this.statusChange({canceled:true});
				this.showCancelStatus();

				
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

		this.statusChange({canceled: false});
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
			this.statusChange({canceled: false});
		} else {
			if(!statusResponse.qa_pass.status) message.push(`Failed to transition to QA Pass: ${statusResponse.qa_pass.data}`);
			if(!statusResponse.merge_code.status) message.push(`Failed to transition to Merge Code: ${statusResponse.merge_code.data}`);
		}

		// show errors if they exist
		if(message.length > 0) this.toastr.showToast(message.join(', '), 'error');

		return message.length === 0;
	 }

}
