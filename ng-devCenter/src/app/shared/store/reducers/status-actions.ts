/**
 * updates a ticket's status
 * @param {RootState} state the current state of the store
 * @param {Object} newStatus action item
 */
export function updateStatus(state, newStatus) {
	const ticketType = `${state.ticketType}_statuses`;

	// get ticket and create new one with new status
	const ticket = state[ticketType].find(ticket => ticket.key === newStatus.key);
	const newTicket = { ...ticket, ...{status: newStatus.status} };

	// replace new ticket object with old one
	const newTickets = state[ticketType].map(ticket => {
		if(newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	// create new state and return it
	return { ...state, ...{[ticketType]: newTickets} };
}

/**
 * adds a crucible Id to a ticket
 * @param {RootState} state the current state of the store
 * @param {Object} newCrucible action item
 */
export function updateCrucible(state, newCrucible) {
	const ticketType = `${state.ticketType}_crucible`;

	// get ticket and create new one with new crucible id
	const ticket = state[ticketType].find(ticket => ticket.key === newCrucible.key);
	const newTicket = { ...ticket, ...{crucible_id: newCrucible.cruid} };

	// replace new ticket object with old one
	const newTickets = state[ticketType].map(ticket => {
		if(newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	// create new state and return it
	return { ...state, ...{[ticketType]: newTickets} };
}

/**
 * adds work log time to a ticket
 * @param {RootState} state the current state of the store
 * @param {Object} newCrucible action item
 */
export function updateWorklog(state, newWorklog) {

	// get ticket and add new work log time to current work log time
	const ticket = state[state.ticketType].find(ticket => ticket.key === newWorklog.key);
	const newTicket = {
		...ticket, 
		dates: { ...ticket.dates, ...{logged_seconds: ticket.dates.logged_seconds + newWorklog.loggedSeconds} }
	};

	// replace new ticket object with old one
	const newTickets = state[state.ticketType].map(ticket => {
		if(newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	// create new state and return it
	return { ...state, ...{[state.ticketType]: newTickets} };
}