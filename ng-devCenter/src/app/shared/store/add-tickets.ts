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
		const devChangeLines = (ticket.dev_changes || '').split(/\n|(\n\r)| /g)
		ticket.pullRequests = getPullRequests(devChangeLines);

		// if we didn't get pull requests from dev changes field try to get from comments
		if(ticket.pullRequests.length == 0) {
			ticket.comments.forEach(comment => {
				const devChangeLines = (comment.raw_comment || '').split(/\n|(\n\r)| |\[|\]|\|/g);
				if(ticket.pullRequests.length == 0) ticket.pullRequests = getPullRequests(devChangeLines);
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
			pullRequests: ticket.pullRequests
		});

		statuses.push({
			status: ticket.status,
			key: ticket.key,
			msrp: ticket.msrp,
			master_branch: ticket.master_branch || ''
		});
	});



	const ticketType = state.ticketType || 'other'

	const newState = {
		[ticketType]: tickets,
		[`${ticketType}_comments`]: comments,
		[`${ticketType}_codeCloud`]: codeClouds,
		[`${ticketType}_statuses`]: statuses,
		[`${ticketType}_dates`]: dates
	};


	return { ...state, ...newState };
}

function getPullRequests(devChangeLines){
	const pullRequests = devChangeLines
		.filter(request => {
			return request && request.startsWith('http') && request.includes('pull-request')
		})
		.map(request => request.trimStart());

	return pullRequests.map(request => {
		request = request.split('\n')[0]; // make sure we only have the url

		const repo = /repos\/(\w+)(\/pull-requests)|(commit)/.exec(request);
		let requestId = /pull-requests\/(\w+)\//.exec(request);
		if(!requestId) console.log('request: ', request);
		if(!requestId) requestId = /pull-requests\/(\w+)/.exec(request);

		return {
			repo: (repo && repo[1]) || 'Unknown Repo', 
			link: request,
			requestId: (requestId && requestId[1]) || ''
		};
	});
}