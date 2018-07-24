import { Actions } from '@store';
import { statuses } from '@models';

/**
 * Processes toast message for QA generator success.
 * @param {APIResponse} response
 */
export function showQaSubmitSuccessMessage(response, postData){
	console.log({response, postData});
	let successMessage = '';
	let errorMessage = '';

	// if repos were given check for pull requests links or diff links 
	if(postData.autoPCR && postData.repos.length > 0){
		const [pullSuccessMessage, pullErrorMessage] = checkPullRequestResponse(response);
		successMessage += pullSuccessMessage;
		errorMessage += pullErrorMessage;

	} else if(postData.repos.length > 0){
		const [diffSuccessMessage, diffErrorMessage] = checkDiffResponse(response);
		successMessage += diffSuccessMessage;
		errorMessage += diffErrorMessage;
	}

	// check for auto pcr
	if(postData.autoPCR){
		const [pcrSuccessMessage, pcrErrorMessage] = checkAutoPcrResponse(postData, response);
		successMessage += pcrSuccessMessage;
		errorMessage += pcrErrorMessage;
	}

	// check for work log
	if(postData.log_time){
		const [pcrSuccessMessage, pcrErrorMessage] = checkWorklogResponse(postData, response);
		successMessage += pcrSuccessMessage;
		errorMessage += pcrErrorMessage;
	}

	// check for QA steps
	if(postData.qa_steps){
		const [qaSuccessMessage, qaErrorMessage] = checkQaStepResponse(postData, response);
		successMessage += qaSuccessMessage;
		errorMessage += qaErrorMessage;
	}

	console.log({successMessage, errorMessage});
	// show any success or error messages found
	if(successMessage) this.toastr.showToast(successMessage, 'success', true);
	if(errorMessage) this.toastr.showToast(errorMessage, 'error', true);
}

/**
 * checks the work log response
 */
export function checkWorklogResponse(postData, response){
	let successMessage = '';
	let errorMessage = '';

	if(response.log_response.status){
		successMessage = 'Work log added.<br>'
	} else {
		errorMessage =  `Adding worklog failed: ${response.log_response.data}<br>`;
	}

	return [successMessage, errorMessage];
}


export function checkQaStepResponse(postData, response){
	let successMessage = '';
	let errorMessage = '';

	if(response.comment_response.status){
		successMessage = 'QA steps created.<br>'
	} else {
		errorMessage =  `Creating QA steps failed: ${response.comment_response.data}<br>`;
	}

	return [successMessage, errorMessage];
}

/**
 * check for CR/PCR transitions and pull request generation
 */
export function checkAutoPcrResponse(postData, response){
	let successMessage = '';
	let errorMessage = '';

	// add any errors for CR/PCR transitions
	if(postData.autoPCR){
		const crMessage = response.cr_response.status ? '' : `Code Review status change failed: ${response.cr_response.data}<br>`;
		const pcrMessage = response.pcr_response.status ? '' : `PCR Needed component change failed: ${response.pcr_response.data}<br>`;
		if(crMessage) errorMessage += crMessage;
		if(pcrMessage) errorMessage += pcrMessage;
	}

	return [successMessage, errorMessage];
}

/**
 * check response for creation of pull request links
 */
export function checkPullRequestResponse(response){
	let successMessage = '';
	let errorMessage = '';

	if(!response.pull_response.status){
		errorMessage = `Error creating pull requests links: ${response.pull_response.data}<br>`;

	} else {
		let pullSuccess = '';
		let pullErrors = '';
		response.pull_response.data.forEach(pull => {
			if(pull.status){
				const link = pull.data.links.self[0].href;
				const repo = pull.data.toRef.repository.name;
				pullSuccess += `<a target="_blank" href='${link}'>${repo}</a><br>`;

			} else {
				const messages = pull.data.errors.map(err => err.message);
				pullErrors += `${messages}<br>`;
			}
		});

		if(pullSuccess) successMessage += `The following pull requests were made: ${pullSuccess}<br>`;
		if(pullErrors) errorMessage += `The following pull requests failed: ${pullErrors}<br>`;
	}

	return [successMessage, errorMessage];
}



/**
 * check response for creation of pull request links
 */
export function checkDiffResponse(response){
	let successMessage = '';
	let errorMessage = '';

	if(!response.diff_response.status){
		errorMessage = `Error creating diff links: ${response.diff_response.data}<br>`;

	} else {
		const pullLinks = (response.diff_response.data || []).map(diff => {
			return `<a target="_blank" href='${diff.link}'>${diff.repo}</a>`;
		});

		successMessage = `Diff links created for:<br>${pullLinks.join('<br>')}<br>`;
	}

	return [successMessage, errorMessage];
}


/**
 * Creates toast message on what is being processed on ticket from form values entered.
 * @param {Object} postData
 */
export function showSubmitMessage(postData):void {
	// create info message based on form selections
	let message = [];
	if(postData.repos.length > 0) message.push('creating Crucible');
	if(postData.qa_steps) message.push('adding comment to Jira');
	if(postData.autoPCR) message.push('transitioning to PCR Needed');
	if(postData.log_time) message.push('logging work');

	// create info message and display
	if(message.length > 1) message[message.length-1] = 'and ' + message[message.length-1];
	const joiner = message.length > 2 ? ', ' : ' ';
	this.toastr.showToast(message.join(joiner), 'info');
}

/**
 * checks for any state changes such as ticket status, crucible ids added, and added comments.
 * @param {Object} postData the data used in the POST call to QA generator endpoint.
 * @param {Object} responseData the data in the response from the QA generator endpoint.
 * @param {boolean} isPcr if true then don't show cancel message.
 */
export function checkForStateChange(postData, responseData, isPcr):void {

	if(responseData.comment_response.status) {
		this.store.dispatch({type: Actions.addComment, payload:responseData.comment_response.data});
	}

	// check for status changes okay - if status change came back success then set to pcr needed
	// else if status change error and we did try to change status then show error
	let status = statuses.INDEV.frontend;
	if (postData.autoPCR && responseData.cr_response.status && responseData.pcr_response.status && responseData.pull_response.status){
		status = statuses.PCRNEED.frontend;

	}

	// if status changed -> update new status
	if(status !== statuses.INDEV.frontend){
		this.statusChange.emit({statusName: status, canceled:false});
	}

	// add work log if given
	if(responseData.log_response.status) {
		this.store.dispatch({type: Actions.updateWorklog, payload: {key:this.key, loggedSeconds:responseData.log_response.data.timeSpentSeconds}});
	}

	// add pull requests if given
	if(responseData.pull_response.status) {
		// this.store.dispatch({type: Actions.updatePullRequests, payload:{ key:this.key, cruid: responseData.cru_response.data}});
	}
}