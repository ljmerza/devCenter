/**
 *
 */
export function updateStatus(state, action) {
	const newStatus = action.payload;

	// get ticket and create new one with new status
	const ticket = state.tickets.find(ticket => ticket.key === newStatus.key);
	const newTicket = { ...ticket, ...{status: newStatus.status} };

	// replace new ticket object with old one
	const newTickets = state.tickets.map(ticket => {
		if(newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	// create new state and return it
	return { ...state, ...{tickets: newTickets} };
}

/**
 *
 */
export function updateCrucible(state, action) {
	const newCrucible = action.payload;

	// get ticket and create new one with new crucible id
	const ticket = state.tickets.find(ticket => ticket.key === newCrucible.key);
	const newTicket = { ...ticket, ...{crucible_id: newCrucible.cruid} };

	// replace new ticket object with old one
	const newTickets = state.tickets.map(ticket => {
		if(newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	// create new state and return it
	return { ...state, ...{tickets: newTickets} };
}