/**
 * add a comment to a ticket to the redux comments array
 * @param {RootState} state
 * @param {Comment} newComment
 * @return {RootState} a new state
 */
export function addComment(state, newComment) {

	// get where the ticket comments are -> add new comment
	const oldTicketComments = state.comments.find(ticketComments => newComment.key === ticketComments.key);
	const newTicketComments = {key:newComment.key, comments:[...oldTicketComments.comments, newComment] };

	// create new tickets comments array
	const newAllComments = state.comments.map(allComments => {
		if(allComments.key === newTicketComments.key) return newTicketComments;
		else return allComments;
	});

	// create new state and return it
	return { ...state, ...{comments: newAllComments} };
}

/**
 * delete a comment from a ticket to the redux comments array
 * @param {RootState} state
 * @param {Comment} removedComment
 * @return {RootState} a new state
 */
export function deleteComment(state, removedComment) {

	// get ticket we are removing a comment from
	const oldTicketComments = state.comments.find(ticketComments => removedComment.key === ticketComments.key);

	// create new ticket's comments object
	const newTicketComments = {key: removedComment.key, comments: oldTicketComments.comments.filter(comment => comment.id !== removedComment.id)};

	// create new comment state
	const newComments = state.comments.map(comments => (newTicketComments.key === comments.key) ? newTicketComments : comments);

	return { ...state, ...{comments: newComments} };
}


/**
 * edit a comment from a ticket into the redux comments array
 * @param {RootState} state
 * @param {Comment} editedComment
 * @return {RootState} a new state
 */
export function editComment(state, editedComment) {

	// get ticket we are editing a comment from
	const oldTicketComments = state.comments.find(ticketComments => editedComment.key === ticketComments.key);

	// replace edited comment and create new ticket's comment
	const newTicketComments = oldTicketComments.comments.map(comment => {
		if(comment.id === editedComment.id) return editedComment;
		else return comment;
	});

	// replace old ticket comments with new one
	const newComments = state.comments.map(comments => (editedComment.key === comments.key) ? {key:editedComment.key, comments:newTicketComments} : comments);

	return { ...state, ...{comments: newComments} };
}