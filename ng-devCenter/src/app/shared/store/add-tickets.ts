
/**
 * adds a list of ticket to the store. Adds them based on the type of list we are trying to retrieve
 */
export function addTickets(state, tickets){
	let comments = [];
	let codeClouds = [];
	let statuses = [];
	let dates = [];

	// extract pull requests
	tickets = tickets.map(ticket => {
		const devChangeWords = (ticket.dev_changes || '').split(/\n|(\n\r)| /g);
		ticket.pullRequests = getPullRequestsFromDevChanges(devChangeWords);

		const devChangeLines = (ticket.dev_changes || '').split(/\n|(\n\r)/g);
		ticket.pcrCountLeft = getPcrCountLeft(devChangeLines, ticket.story_point);
		if(ticket.pcrCountLeft) console.log(ticket.pcrCountLeft, ticket.key);

		// if we didn't get pull requests from dev changes field try to get from comments
		if(ticket.pullRequests.length == 0) {
			ticket.comments.forEach(comment => {
				const devChangeLines = (comment.raw_comment || '').split(/\n|(\n\r)| |\[|\]|\|/g);
				if(ticket.pullRequests.length == 0) 
					ticket.pullRequests = getPullRequestsFromDevChanges(devChangeLines);
			});
		}

		return ticket;
	});

	tickets.forEach(ticket => {
		comments.push({
			comments: ticket.comments,
			key: ticket.key,
			msrp: ticket.msrp
		});

		codeClouds.push({
			key: ticket.key,
			msrp: ticket.msrp,
			pullRequests: ticket.pullRequests,
			username: ticket.username,
			displayName: ticket.display_name
		});

		statuses.push({
			status: ticket.status,
			key: ticket.key,
			msrp: ticket.msrp,
			master_branch: ticket.master_branch || ''
		});
	});

	const ticketType = state.ticketType || 'other';
	
	const newState = {
		[ticketType]: tickets,
		[`${ticketType}_comments`]: comments,
		[`${ticketType}_codeCloud`]: codeClouds,
		[`${ticketType}_statuses`]: statuses,
		[`${ticketType}_dates`]: dates
	};


	return { ...state, ...newState };
}

/**
 *
 */
function getPcrCountLeft(devChangeLines, storyPoint){

	// get any lines that might have pcr needed
	const pcrRemaining = devChangeLines.find(line => line && /PCR/i.test(line) && !/Pull Request/i.test(line));
	if(!pcrRemaining) return;

	// get only the numbers
	const potentialPcrs = pcrRemaining.replace(/^[0-9]/g, '');
	if(!potentialPcrs) return;

	// get the PCR needed for the ticket - if smaller  
	// then most likely PCR remaining else definitely not
	const pcrNeeded = Math.ceil(storyPoint/2);
	if(pcrNeeded < potentialPcrs) return;
	else return potentialPcrs;
}

/**
 *
 */
function getPullRequestsFromDevChanges(devChangeLines){
	const pullRequests = devChangeLines
		.filter(request => {
			return request && 
			request.startsWith('http') 
			&& (request.includes('pull-request') || request.includes('compare/commits'))
		})
		.map(request => request.trimStart());

	return getPullRequests(pullRequests);
}

/**
 *
 */
export function getPullRequests(pullRequests){
	return pullRequests.map(request => {
		request = request.split('\n')[0]; // make sure we only have the url

		let repo = /repos\/(\w+)\/pull-requests/.exec(request);
		let repoName = repo && repo[1];
		let requestId;

		// if we found a repo name then is a pull request 
		// else we found a diff link
		if(repoName){
			requestId = /pull-requests\/(\w+)\/?/.exec(request);
		} else {
			repo = /repos\/(\w+)\/compare\/commits/.exec(request);
		 	repoName = repo && repo[1];
		 	if(repoName) repoName+= ' (Diff Link)';
		}

		return {
			repo: repoName || 'Unknown Repo', 
			link: request,
			requestId: (requestId && requestId[1]) || ''
		};
	});
}