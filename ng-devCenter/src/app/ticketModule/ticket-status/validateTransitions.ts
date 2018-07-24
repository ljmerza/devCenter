import { statuses } from '@models';
import { Actions } from '@store';

/**
 * Creates valid transitions array for status dropdown
 */
export function validateTransitions() {
	if([statuses.SPRINT.frontend,statuses.ONHOLD.frontend].includes(this.ticketStatus)){
		this.ticketStates = this.allTransistions.filter(state => [statuses.INDEV.frontend].includes(state.name));
	} else if(this.ticketStatus === statuses.INDEV.frontend){
		this.ticketStates = this.allTransistions.filter(state => [statuses.SPRINT.frontend,statuses.PCRNEED.frontend].includes(state.name));
	
	} else if(this.ticketStatus === statuses.PCRNEED.frontend){
		this.ticketStates = this.allTransistions.filter(state => [statuses.INDEV.frontend,statuses.PCRWORK.frontend, statuses.PCRPASS.frontend].includes(state.name));
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
 * verifies the ticket state changes were successful.
 * @param {APIResponse} statusResponse the response object from the API call to change status
 * @param {string} statusType the status type string
 */
export function verifyStatusChangeSuccess(statusResponse, statusType:string, postData){
	console.log({statusResponse, statusType, postData});

	// check QA pass
	if(statusType === statuses.QAPASS.backend){
		if( this.qaPassVerify(statusResponse.data) ) return;
	}

	if(statusType === statuses.QAPASS.backend){
		if( this.verifyDiffGeneration(statusResponse.data) ) return;
	}

	// add log if commit hash comment was success
	if(postData.add_commits && statusResponse.status){
		this.toastr.showToast(`Added commit hash comment to ${this.key}`, 'success');
		this.store.dispatch({type: Actions.addComment, payload: statusResponse.data});
	}

	this.statusChange({canceled: false});
	this.toastr.showToast(`Status successfully changed for ${this.key}`, 'success');
}

export function verifyDiffGeneration(statusResponse, postData){
	
}

/**
 * Verifies QA pass comment and status transitions.
 * @param {APIResponse} statusResponse the response object from the API call to change status
 */
 export function qaPassVerify(statusResponse):boolean{
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