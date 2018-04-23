/**
 * updates a ticket's status
 * @param {RootState} state the current state of the store
 * @param {Object} newStatus action item
 */
export function updateStatus(state, newStatus) {
	const ticketListType = newStatus.ticketListType;

	// get ticket and create new one with new status
	const ticket = state[ticketListType].find(ticket => ticket.key === newStatus.key);
	const newTicket = { ...ticket, ...{status: newStatus.status} };

	// replace new ticket object with old one
	const newTickets = state[ticketListType].map(ticket => {
		if(newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	// create new state and return it
	return { ...state, ...{[ticketListType]: newTickets} };
}

/**
 * adds a crucible Id to a ticket
 * @param {RootState} state the current state of the store
 * @param {Object} newCrucible action item
 */
export function updateCrucible(state, newCrucible) {
	const ticketListType = newCrucible.ticketListType;

	// get ticket and create new one with new crucible id
	const ticket = state[ticketListType].find(ticket => ticket.key === newCrucible.key);
	const newTicket = { ...ticket, ...{crucibleId: newCrucible.cruid} };

	// replace new ticket object with old one
	const newTickets = state[ticketListType].map(ticket => {
		if(newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	// create new state and return it
	return { ...state, ...{[ticketListType]: newTickets} };
}

/**
 * adds work log time to a ticket
 * @param {RootState} state the current state of the store
 * @param {Object} newCrucible action item
 */
export function updateWorklog(state, newWorklog) {
	const ticketListType = newWorklog.ticketListType;

	// get ticket and add new work log time to current work log time
	const ticket = state[ticketListType].find(ticket => ticket.key === newWorklog.key);
	const newWorklogTime = newWorklog.loggedSeconds + ticket.dates.logged_seconds;

	const newTicket = {
		key: newWorklog.key, 
		dates: { ...ticket.dates, ...{logged_seconds: newWorklogTime} }
	};

	// replace new ticket object with old one
	const newTickets = state[ticketListType].map(ticket => {
		if(newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	// create new state and return it
	return { ...state, ...{[ticketListType]: newTickets} };
}