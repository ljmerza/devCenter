import { Ticket } from './models/ticket';
import { Actions } from './actions';

export interface RootState {
	tickets: Array<Ticket>
}


export const initialState: RootState = {
	tickets: []
}

/**
 *
 */
export function rootReducer(state, action){
	switch(action.type){
		case Actions.newTickets:
			return { ...state, ...{tickets: action.payload} };
		case Actions.addComment:
			return addComment(state, action);
		case Actions.removeComment:
			return removeComment(state, action);
		case Actions.editComment:
			return editComment(state, action);
		default:
			return state;
	}	
}

/**
 *
 */
function addComment(state, action) {
	const newComment = action.payload;

	// get ticket we are adding a new comment to
	const ticket = state.tickets.filter(ticket => ticket.key === newComment.key);

	// create new comments array for ticket then whole new ticket object
	const ticketComments = [...ticket.comments, newComment];
	const newTicket = { ...ticket, ...{comments: ticketComments} };

	// replace new ticket object with old one
	const newTickets = state.tickets.map(ticket => {
		if(!newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	// create new state and return it
	return { ...state, ...{tickets: newTickets} };
}

/**
 *
 */
function removeComment(state, action) {
	const removedComment = action.payload;

	// get ticket we are removing a comment from
	const ticket = state.tickets.filter(ticket => ticket.key === removedComment.key);
	// filter out removed comment and replace comments on ticket
	const newComments = ticket.comments.filter(comment => ticket.id !== removedComment.id);
	const newTicket = { ...ticket, ...{comments:newComments} };

	// replace new ticket object with old one
	const newTickets = state.tickets.map(ticket => {
		if(!newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	return { ...state, ...{tickets: newTickets} };
}


/**
 *
 */
function editComment(state, action) {
	const editedComment = action.payload;

	// get ticket we are editing a comment from
	const ticket = state.tickets.filter(ticket => ticket.key === editedComment.key);

	// replace edited comment and create new ticket
	const newComments = ticket.comments.map(comment => {
		if(!comment.id === comment.id) return editedComment;
		else return comment;
	});
	const newTicket = { ...ticket, ...{comments:newComments} };

	// replace new ticket object with old one
	const newTickets = state.tickets.map(ticket => {
		if(!newTicket.key === ticket.key) return newTicket;
		else return ticket;
	});

	return { ...state, ...{tickets: newTickets} };
}