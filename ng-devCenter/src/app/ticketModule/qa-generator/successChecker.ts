import { Actions } from '@store';
import { statuses } from '@models';

/**
 * Processes toast message for QA generator success/fail.
 * @param {APIResponse} response
 * @param {Object} postData
 */
export function showQaSubmitSuccessMessage(response, postData){
	console.log({response, postData});
	let successMessage = '';

	// if repos were given check for pull requests links or diff links 
	if(postData.autoPCR && postData.repos.length > 0){
		let [error, success] = checkPullRequestResponse(response);
		if(success) successMessage += success;
		if (error) this.toastr.showToast(`The following pull requests failed:<br>${error}`, 'error', true);

	} else if(postData.repos.length > 0){
		let [error, success] = checkDiffResponse(response);
		if(success) successMessage += success;
		if (error) this.toastr.showToast(`The following diff links failed:<br>${error}`, 'error', true);
	}

	if(postData.autoPCR){
		let [error, success] = checkAutoPcrResponse(postData, response);
		if(success) successMessage += success;
		if (error) this.toastr.showToast(error, 'error', true);
	}

	if(postData.log_time){
		let [error, success] = checkWorklogResponse(postData, response);
		if(success) successMessage += success;
		if (error) this.toastr.showToast(error, 'error', true);
	}

	if(postData.qa_steps){
		let [error, success] = checkQaStepResponse(postData, response);
		if(success) successMessage += success;
		if (error) this.toastr.showToast(error, 'error', true);
	}

	console.log({successMessage});
	if(successMessage) this.toastr.showToast(successMessage, 'success', true);
}

/**
 * checks the work log response
 */
export function checkWorklogResponse(postData, response){
	let success = '';
	let error = '';

	if(response.log_response.status){
		success = 'Work log added<br>'
	} else {
		error = `Adding worklog failed: ${response.log_response.data}`;
	}

	return [error, success];
}

/**
 *
 */
export function checkQaStepResponse(postData, response){
	let success = '';
	let error = '';

	if(response.comment_response.status){
		success =  'QA steps created<br>'
	} else {
		error = `Creating QA steps failed: ${response.comment_response.data}`;
	}

	return [error, success];
}

/**
 * check for CR/PCR transitions and pull request generation
 */
export function checkAutoPcrResponse(postData, response){
	let success = '';
	let error = '';

	if(response.cr_response.status){
		success += 'CR status changed<br>';
	}else {
		error +=  `Code Review status change failed<br>`;
	}

	if(response.pcr_response.status){
		success += 'PCR component added<br>';
	}else {
		error += `PCR Needed component change failed<br>`;
	}

	if(response.dev_change_response.status){
		success += 'Added pull requests to dev changes<br>';
	}else {
		error += `Adding pull requests to dev changes failed<br>`;
	}

	return [error, success];
}

/**
 * check response for creation of pull request links
 */
export function checkPullRequestResponse(response){
	let success = '';
	let error = '';

	response.pull_response.data.forEach(pull => {
		if(pull.link){
			success += `<a target="_blank" href='${pull.link}'>${pull.repo}</a><br>`;
		} else {
			error += `${pull.repo}: ${pull.error}<br>`;
		}
	});

	if(success) success = `The following pull requests were made:<br> ${success}<br>`;
	return [error, success];
}



/**
 * check response for creation of pull request links
 */
export function checkDiffResponse(response){
	let success = '';
	let error = '';

	if(!response.diff_response.status){
		error = `Error creating diff links: ${response.diff_response.data}`;

	} else {
		const pullLinks = (response.diff_response.data || [])
			.map(diff => `<a target="_blank" href='${diff.link}'>${diff.repo}</a>`)
			.join('<br>');

		success = `Diff links created for:<br>${pullLinks}<br>`;
	}

	return [error, success];
}


/**
 * Creates toast message on what is being processed on ticket from form values entered.
 * @param {Object} postData
 */
export function showSubmitMessage(postData):void {
	// create info message based on form selections
	let message = [];
	if(postData.repos.length > 0 && postData.autoPcr) message.push('Creating Pull Requests');
	else if(postData.repos.length > 0 ) message.push('Creating Diff Links');
	if(postData.qa_steps) message.push('Adding QA Steps to Jira');
	if(postData.autoPCR) message.push('transitioning to PCR Needed/Code Review');
	if(postData.log_time) message.push('Adding to Worklog');

	// create info message and display
	if(message.length > 1) message[message.length-1] = 'and ' + message[message.length-1];
	const joiner = message.length > 2 ? ', ' : ' ';
	this.toastr.showToast(message.join(joiner), 'info');
}

/**
 * checks for any state changes such as ticket status, crucible ids added, and added comments.
 * @param {Object} postData the data used in the POST call to QA generator endpoint.
 * @param {Object} responseData the data in the response from the QA generator endpoint.
 */
export function checkForStateChange(postData, responseData):void {
	console.log({postData, responseData});

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
		const payload = {key:this.key, pullRequests: responseData.pull_response.data};
		this.store.dispatch({type: Actions.updatePullRequests, payload});
	}
}