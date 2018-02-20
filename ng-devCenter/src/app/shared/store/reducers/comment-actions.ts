/**
 *
 */
export function addComment(state, action) {
	const newComment = action.payload;

	// get where the ticket comments are -> add new comment
	const commentIndex = state.comments.indexOf(ticketComments => ticketComments.key === newComment.key);
	console.log('commentIndex: ', commentIndex);
	const oldTicketComments = state.comments[commentIndex] || [];
	console.log('oldTicketComments: ', oldTicketComments);
	const newTicketComments = [...oldTicketComments, newComment];
	console.log('newTicketComments: ', newTicketComments);


	// get a ticket's comments
	const ticketComments = state.comments.find(allComments => allComments.key === newComment.key);
	const comments = (ticketComments && ticketComments.comments) || [];

	const newAllComments = state.comments.map(allComments => {
		if(allComments.key === newComment.key) return {key: newComment.key, comments};
		else return allComments;
	});

	console.log('newAllComments: ', newAllComments);

	// create new state and return it
	return { ...state, ...{comments: newAllComments} };
}

/**
 *
 */
export function deleteComment(state, action) {
	const removedComment = action.payload;

	// get ticket we are removing a comment from
	const ticket = state.tickets.find(ticket => ticket.key === removedComment.key);

	// filter out removed comment and replace comments on ticket
	const newComments = ticket.comments.filter(comment => comment.id !== removedComment.id);
	const newTicket = { ...ticket, ...{comments:newComments} };

	// replace new ticket object with old one
	const newTickets = state.tickets.map(ticket => {
		if(newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	return { ...state, ...{tickets: newTickets} };
}


/**
 *
 */
export function editComment(state, action) {
	const editedComment = action.payload;

	// get ticket we are editing a comment from
	const ticket = state.tickets.find(ticket => ticket.key === editedComment.key);

	// replace edited comment and create new ticket
	const newComments = ticket.comments.map(comment => {
		if(comment.id === editedComment.id) return editedComment;
		else return comment;
	});

	const newTicket = { ...ticket, ...{comments:newComments} };

	// replace new ticket object with old one
	const newTickets = state.tickets.map(ticket => {
		if(newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	return { ...state, ...{tickets: newTickets} };
}