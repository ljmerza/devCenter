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