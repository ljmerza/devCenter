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

import { validateTransitions, verifyStatusChangeSuccess,} from './validateTransitions';

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

	// imported functions to inherit
	validateTransitions;
	verifyStatusChangeSuccess;

	ticketDropdown;
	qaComponentRef;
	statusComponentRef;

	statusType: string;
	statusName: string;

	ticketStatus;
	msrp;
	masterBranch;
	devChanges;

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
		this.validateTransitions = validateTransitions;
		this.verifyStatusChangeSuccess = verifyStatusChangeSuccess;
	}

	/**
	 * watch for changes to comments in store
	 */
	ngOnInit() {
		this.route.paramMap.subscribe((routeResponse:any) => {
			this.ticketListType = routeResponse.params.filter || 'mytickets';
			this.getTicketStatusData();
			this.getTicketPullRequests();
		});
	}

	/**
	 *
	 */
	getTicketStatusData(){
		this.status$ = this.store.select(`${this.ticketListType}_statuses`)
			.subscribe((allTickets:Array<Ticket>=[]) => {
				const ticket:any = allTickets.find(ticket => ticket.key === this.key) || {};
				
				this.ticketStatus = ticket.status;
				this.msrp = ticket.msrp;
				this.masterBranch = ticket.master_branch;
				this.devChanges = ticket.dev_changes;
				this.validateTransitions();
			});
	}

	/**
	 *
	 */
	getTicketPullRequests(){
		this.pullRequests$ = this.store.select(`${this.ticketListType}_codeCloud`)
			.subscribe((allTickets:any=[]) => {
				const ticket = allTickets.find(ticket => ticket.key === this.key) || {};
				this.pullRequests = ticket.pullRequests || '';
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

		// if pcr working status change then open all pull request links
		if(!canceled && this.ticketDropdown.value === statuses.PCRWORK.backend){
			this.openPullRequests();
		}

		// update store
		const status = (this.ticketStates.find(ticketStateFilter) as any).name;
		this.store.dispatch({ type: Actions.updateStatus, payload: {key:this.key, status} });

		if(canceled && !hideToast){
			this.showCancelStatus();
		}
	}

	/**
	 * open new windows for all pull requests for this ticket
	 */
	openPullRequests(){
		(this.pullRequests || []).map(pull => {
			const newWindow = window.open(pull.link, '_blank');
			if(!newWindow){
				this.toastr.showToast(`Could not open new window. Maybe you blocked the new window?`, 'error');
 			}
		});
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
		let postData:any = {
			key:this.key, 
			statusType, 

			// data needed for different types of transitions - just always sent it to simplify
			pullRequests: this.pullRequests,
			devChanges: this.devChanges,
			repoName: this.masterBranch
		};

		// if transitioning from merge code to uct ready then add commit hash Jira comment
		if(statusType === statuses.UCTREADY.backend && this.ticketStatus === statuses.MERGECODE.frontend){
			postData.addCommits = true;
			postData.masterBranch = this.masterBranch;
			this.toastr.showToast(`Removing Merge Code component and adding commit hash Jira comment to ${this.key}`, 'info');
		}
		
		this.jira.changeStatus(postData)
		.subscribe(
			statusResponse => {
				this.verifyStatusChangeSuccess(statusResponse, statusType, postData);
				
				// if we made a commit comment then add to ticket
				if(statusResponse.data.commit_comment && statusResponse.data.commit_comment.status){
					this.store.dispatch({type: Actions.addComment, payload:statusResponse.data.commit_comment.data});
				}
			},
			error => {
				this.jira.processErrorResponse(error);
				this.statusChange({canceled:true});
				this.showCancelStatus();
			}
		);
	}
}