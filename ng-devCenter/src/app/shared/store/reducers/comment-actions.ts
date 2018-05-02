/**
 * add a comment to a ticket to the redux comments array
 * @param {RootState} state
 * @param {Comment} newComment
 * @return {RootState} a new state
 */
export function addComment(state, newComment) {
	const ticketType = `${state.ticketType}_comments`;

	const oldTicket = state[ticketType].find(ticket => newComment.key === ticket.key);

	const newTicketComments = [...oldTicket.comments, newComment];

	const newTickets = state[ticketType].map(ticket => {
		if(newComment.key === ticket.key) {
			return {...oldTicket, ...{comments:newTicketComments}}
		} else {
			return ticket;
		};
	});

	return { ...state, ...{[ticketType]: newTickets} };
}

/**
 * delete a comment from a ticket to the redux comments array
 * @param {RootState} state
 * @param {Comment} removedComment
 * @return {RootState} a new state
 */
export function deleteComment(state, removedComment) {
	const ticketType = `${state.ticketType}_comments`;
	const oldTicket = state[ticketType].find(ticket => removedComment.key === ticket.key);

	const newTicketComments = oldTicket.comments.filter(comment => comment.id !== removedComment.id);

	const newTickets = state[ticketType].map(ticket => {
		if(removedComment.key === ticket.key) {
			return {...oldTicket, ...{comments:newTicketComments}}
		} else {
			return ticket;
		};
	});

	return { ...state, ...{[ticketType]: newTickets} };
}


/**
 * edit a comment from a ticket into the redux comments array
 * @param {RootState} state
 * @param {Comment} editedComment
 * @return {RootState} a new state
 */
export function editComment(state, editedComment) {
	const ticketType = `${state.ticketType}_comments`;
	const oldTicket = state[ticketType].find(ticket => editedComment.key === ticket.key);

	const newTicketComments = oldTicket.comments.map(comment => {
		if(comment.id === editedComment.id) return editedComment;
		else return comment;
	});

	const newTickets = state[ticketType].map(ticket => {
		if(editedComment.key === ticket.key) {
			return {...oldTicket, ...{comments:newTicketComments}}
		} else {
			return ticket;
		};
	});

	return { ...state, ...{[ticketType]: newTickets} };
}