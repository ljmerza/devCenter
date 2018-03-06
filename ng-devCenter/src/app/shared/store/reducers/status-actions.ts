/**
 * updates a ticket's status
 * @param {RootState} state the current state of the store
 * @param {Object} newStatus action item
 */
export function updateStatus(state, newStatus) {

	// get ticket and create new one with new status
	const ticket = state.statuses.find(ticket => ticket.key === newStatus.key);
	const newTicket = { ...ticket, ...{status: newStatus.status} };

	// replace new ticket object with old one
	const newTickets = state.statuses.map(ticket => {
		if(newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	// create new state and return it
	return { ...state, ...{statuses: newTickets} };
}

/**
 * adds a crucible Id to a ticket
 * @param {RootState} state the current state of the store
 * @param {Object} newCrucible action item
 */
export function updateCrucible(state, newCrucible) {

	// get ticket and create new one with new crucible id
	const ticket = state.crucibleIds.find(ticket => ticket.key === newCrucible.key);
	const newTicket = { ...ticket, ...{crucibleId: newCrucible.cruid} };

	// replace new ticket object with old one
	const newTickets = state.crucibleIds.map(ticket => {
		if(newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	// create new state and return it
	return { ...state, ...{crucibleIds: newTickets} };
}

/**
 * adds work log time to a ticket
 * @param {RootState} state the current state of the store
 * @param {Object} newCrucible action item
 */
export function updateWorklog(state, newWorklog) {

	// get ticket and add new work log time to current work log time
	const ticket = state.crucibleIds.find(ticket => ticket.key === newWorklog.key);
	const newWorklogTime = newWorklog.loggedSeconds + ticket.dates.logged_seconds;

	const newTicket = { 
		...ticket, 
		...{
			dates: {
				logged_seconds: newWorklogTime
			}
		} 
	};

	// replace new ticket object with old one
	const newTickets = state.crucibleIds.map(ticket => {
		if(newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	// create new state and return it
	return { ...state, ...{crucibleIds: newTickets} };
}