import { 
	Component, Input, ViewContainerRef, ViewChild, OnDestroy, OnChanges,
	ComponentFactoryResolver, OnInit, ChangeDetectionStrategy
} from '@angular/core';

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
	entryComponents: [QaGeneratorComponent]
})
export class TicketStatusComponent implements OnInit, OnDestroy, OnChanges {
	ticketStates:Array<any> = [];

	ticketDropdown;
	qaComponentRef;
	statusComponentRef;

	statusType: string;
	statusName: string;

	ticketStatus;
	msrp;
	masterBranch;
	devChanges;
	allStatuses;

	status$
	ticketType$;

	pullRequests$;
	pullRequests;

	@Input() key;
	@ViewChild(ModalComponent) modal: ModalComponent;

	constructor(
		private factoryResolver: ComponentFactoryResolver, private store:NgRedux<RootState>,
		private viewContRef: ViewContainerRef, private toastr: ToastrService, private jira: JiraService, 
	) { 
		this.allStatuses = statuses;
	}

	/**
	 * watch for changes to comments in store
	 */
	ngOnInit() {
		this.getStoreData();
	}

	ngOnChanges(changes){
		if(!changes.firstChange && changes.key.currentValue !== changes.key.previousValue){
			this.getStoreData();
		}
	}

	/**
	 *
	 */
	ngOnDestroy(){
		this.ticketType$ && this.ticketType$.unsubscribe();
		this.status$ && this.status$.unsubscribe();
		this.pullRequests$ && this.pullRequests$.unsubscribe();
	}

	/**
	 *
	 */
	getStoreData(){
		this.ticketType$ =  this.store.select(`ticketType`).subscribe(ticketType => {

			this.status$ = this.store.select(`${ticketType}_statuses`)
				.subscribe((allTickets:Array<Ticket>=[]) => {
					const ticket:any = allTickets.find(ticket => ticket.key === this.key) || {};
					
					this.ticketStatus = ticket.status;
					this.msrp = ticket.msrp;
					this.masterBranch = ticket.master_branch;
					this.devChanges = ticket.dev_changes;
					this.validateTransitions();
				});

			this.pullRequests$ = this.store.select(`${ticketType}_codeCloud`)
				.subscribe((allTickets:any=[]) => {
					const ticket = allTickets.find(ticket => ticket.key === this.key) || {};
					this.pullRequests = ticket.pullRequests || '';
				});
		});
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
				if(statusResponse.data && statusResponse.data.commit_comment && statusResponse.data.commit_comment.status){
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

	/**
	 * Creates valid transitions array for status dropdown
	 */
	validateTransitions() {
		if([statuses.SPRINT.frontend,statuses.ONHOLD.frontend].includes(this.ticketStatus)){
			this.ticketStates = allTransistions.filter((state:any) => [statuses.INDEV.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.INDEV.frontend){
			this.ticketStates = allTransistions.filter((state:any) => [statuses.SPRINT.frontend,statuses.PCRNEED.frontend].includes(state.name));
		
		} else if(this.ticketStatus === statuses.PCRNEED.frontend){
			this.ticketStates = allTransistions.filter((state:any) => [statuses.PCRWORK.frontend, statuses.PCRPASS.frontend,statuses.INDEV.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.PCRWORK.frontend){
			this.ticketStates = allTransistions.filter((state:any) => [statuses.PCRPASS.frontend,statuses.PCRCOMP.frontend,statuses.MERGECONF.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.PCRPASS.frontend){
			this.ticketStates = allTransistions.filter((state:any) => [statuses.PCRCOMP.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.PCRCOMP.frontend){
			this.ticketStates = allTransistions.filter((state:any) => [statuses.CRWORK.frontend].includes(state.name));
		
		} else if(this.ticketStatus === statuses.CRWORK.frontend){
			this.ticketStates = allTransistions.filter((state:any) => [statuses.QAREADY.frontend, statuses.CRFAIL.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.CRFAIL.frontend){
			this.ticketStatus = statuses.INDEV.frontend;
			this.ticketStates = allTransistions.filter((state:any) => [statuses.PCRNEED.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.QAREADY.frontend){
			this.ticketStates = allTransistions.filter((state:any) => [statuses.INQA.frontend].includes(state.name));
		
		} else if(this.ticketStatus === statuses.INQA.frontend){
			this.ticketStates = allTransistions.filter((state:any) => [statuses.QAFAIL.frontend,statuses.QAPASS.frontend,statuses.MERGECONF.frontend,statuses.QAREADY.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.QAFAIL.frontend){
			this.ticketStatus = statuses.INDEV.frontend;
			this.ticketStates = allTransistions.filter((state:any) => [statuses.PCRNEED.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.QAPASS.frontend){
			this.ticketStatus = statuses.MERGECODE.frontend;
			this.ticketStates = allTransistions.filter((state:any) => [statuses.UCTREADY.frontend].includes(state.name));
		
		} else if(this.ticketStatus === statuses.UCTREADY.frontend){
			this.ticketStates = allTransistions.filter((state:any) => [statuses.INUCT.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.INUCT.frontend){
			this.ticketStates = allTransistions.filter((state:any) => [statuses.UCTREADY.frontend,statuses.UCTFAIL.frontend,statuses.UCTPASS.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.UCTPASS.frontend){
			this.ticketStatus = statuses.RELEASE.frontend;
			this.ticketStates = [];
		} else if(this.ticketStatus === statuses.UCTFAIL.frontend){
			this.ticketStatus = statuses.INDEV.frontend;
			this.ticketStates = allTransistions.filter((state:any) => [statuses.PCRNEED.frontend].includes(state.name));

		} else if(this.ticketStatus ===statuses.MERGECONF.frontend){
			this.ticketStates = allTransistions.filter((state:any) => [statuses.PCRNEED.frontend, statuses.PCRCOMP.frontend, statuses.QAREADY.frontend].includes(state.name));
		} else if(this.ticketStatus === statuses.MERGECODE.frontend){
			this.ticketStates = allTransistions.filter((state:any) => [statuses.UCTREADY.frontend].includes(state.name));
		
		} else if([statuses.RELEASE.frontend].includes(this.ticketStatus)){
			this.ticketStates = [];
		} else {
			this.ticketStates = allTransistions;
		}

		// if current status not in list of statues then add to beginning
		if( !(this.ticketStates.find(state => state.name == this.ticketStatus) )){
			this.ticketStates.unshift({name: this.ticketStatus, id: ''});
		}

		// always allow to generate diff links
		this.ticketStates.push(allTransistions.find((state:any) => state.name === statuses.QAGEN.frontend));
	}

	/**
	 * verifies the ticket state changes were successful.
	 * @param {APIResponse} statusResponse the response object from the API call to change status
	 * @param {string} statusType the status type string
	 */
	verifyStatusChangeSuccess(statusResponse, statusType:string, postData){

		if(statusType === statuses.QAPASS.backend){
			if(this.qaPassVerify(statusResponse.data)) return;
		}

		if(statusType === statuses.PCRCOMP.backend){
			this.verifyPcrComplete(statusResponse.data);
		}


		if(statusType === statuses.UCTREADY.backend){
			this.verifyUctReady(statusResponse.data);
		}

		this.statusChange({canceled: false});
		this.toastr.showToast(`Status successfully changed for ${this.key}`, 'success');
	}

	verifyUctReady(statusResponse){

		if(!statusResponse.uct_pass.status){
			this.toastr.showToast(`Failed to remove merge code component: ${statusResponse.uct_pass.data}`, 'error');
		}

		// if we didnt do any commit comments then we are done here
		if(!statusResponse.commit_ids) return;

		// check for commit ids
		if(!statusResponse.commit_ids.status){
			let commitMessage = statusResponse.commit_ids.data;

			if(Array.isArray(commitMessage)){
				commitMessage = commitMessage
					.map(commit => `${commit.repo_name}: ${commit.commit_id}`)
					.join('<br>');
			}

			this.toastr.showToast(`Failed to add commit comment to Jira ticket: ${commitMessage}`, 'error');
		}

		// check for commit comment added
		if(!statusResponse.commit_comment.status){
			this.toastr.showToast(`Failed to add commit comment: ${statusResponse.data.commit_comment.data}`, 'error');
		}

		// if both passed then show success
		if(statusResponse.commit_comment.status && statusResponse.commit_ids.status) {
			let commitMessage = statusResponse.commit_ids.data
				.map(commit => `${commit.repo_name}: ${commit.commit_id}`)
				.join('<br>');

			this.toastr.showToast(`Added commit comment for:<br>${commitMessage}`, 'success');
		}
	}

	/**
	 *
	 */
	verifyPcrComplete(statusResponse){
		let success = '';

		// check for pull comment errors
		let pullErrors = false;
		statusResponse.add_comment.forEach(pull => {
			if(!pull.status){
				const errors = this._getPullErrors(pull);
				this.toastr.showToast(`Failed to add pcr complete to pull request: ${errors}`, 'error');
				pullErrors = true;
			}
		});
		if(!pullErrors) success = `PCR Complete comment added to all pull requests`;

		// check for pull approve errors
		let approveErrors = false;
		statusResponse.pass_response.forEach(pull => {
			if(!pull.status){
				const errors = this._getPullErrors(pull);
				this.toastr.showToast(`Failed to approve pull request: ${errors}`, 'error');
				approveErrors = true;
			}
		});
		if(!approveErrors) success = `Pull Request approved to all pull requests`;

		if(!statusResponse.set_pcr_complete.status){
			this.toastr.showToast(`Failed to transition status to PCR Complete: ${statusResponse.comment_response.data}`, 'error');
		}
	}

	/**
	 * gets any errors involved with pull requests
	 * @param {Object} pull the pull request object from the server
	 */
	_getPullErrors(pull){
		let errors = '';

		if(pull.data && pull.data.errors && Array.isArray(pull.data.errors)){
			errors = pull.data.errors.map(error => error.message).join(', ');
		} else if(pull.data && pull.data.errors){
			errors = pull.data.errors;
		} else if(pull.data){
			errors = pull.data;
		} else {
			errors = 'Unknown Error';
		}

		return errors;
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