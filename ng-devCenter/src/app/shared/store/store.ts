import { Ticket, Comment, Repo } from '@models';

import { addComment, deleteComment, editComment, updateStatus, updateCrucible } from './reducers';
import { Actions } from './actions';

export interface RootState {
	tickets: Array<Ticket>,
	comments: Array<Comment>,
	repos: Array<Repo>,
	userProfile: any,
	statuses: any,
	crucibleId: any
}

export const initialState: RootState = {
	tickets: [],
	comments: [],
	repos: [],
	userProfile: {},
	statuses: [],
	crucibleId: []
}

/**
 *
 */
export function rootReducer(state, action){
	switch(action.type){
		case Actions.newTickets:
			return addTickets(state, action.payload);
		case Actions.repos:
			return { ...state, ...{repos:action.payload} };
		case Actions.userProfile:
			return { ...state, ...{userProfile:action.payload} };

		case Actions.addComment:
			return addComment(state, action.payload);
		case Actions.deleteComment:
			return deleteComment(state, action.payload);
		case Actions.editComment:
			return editComment(state, action.payload);
			
		case Actions.updateStatus:
			return updateStatus(state, action.payload);
		case Actions.updateCrucible:
			return updateCrucible(state, action.payload);

		default:
			return state;
	}	
}

/**
 *
 */
function addTickets(state, allTickets){
	const comments = allTickets.map(ticket => {
		return {comments:ticket.comments, key:ticket.key}
	});

	const statuses = allTickets.map(ticket => {
		return {status:ticket.status, key:ticket.key}
	});

	const crucibleId = allTickets.map(ticket => {
		return {crucibleId:ticket.crucible_id, key:ticket.key}
	});

	const tickets = allTickets.map(ticket => { 
		// delete ticket.comments; 
		// delete ticket.statuses; 
		// delete ticket.crucible_id; 
		return ticket;
	});

	return { ...state, ...{comments, tickets, statuses, crucibleId} };
}