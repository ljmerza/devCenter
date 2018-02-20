import { Ticket } from './models/ticket';
import { Comment } from './models/comment';
import { Repo } from './models/repo';
import { Actions } from './actions';

import * as commentActions from './reducers/comment-actions';
import * as statusActions from './reducers/status-actions';

export interface RootState {
	tickets: Array<Ticket>,
	comments: Array<Comment>,
	repos: Array<Repo>,
	userProfile: any
}

export const initialState: RootState = {
	tickets: [],
	comments: [],
	repos: [],
	userProfile: {},
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
			return commentActions.addComment(state, action);
		case Actions.deleteComment:
			return commentActions.deleteComment(state, action);
		case Actions.editComment:
			return commentActions.editComment(state, action);
			
		case Actions.updateStatus:
			return statusActions.updateStatus(state, action.payload);
		case Actions.updateCrucible:
			return statusActions.updateCrucible(state, action.payload);

		default:
			return state;
	}	
}

function addTickets(state, allTickets){
	const comments = allTickets.map(ticket => {
		return {
			comments:ticket.comments,
			key: ticket.key
		}
		
	});
	const tickets = allTickets.map(ticket => { 
		delete ticket.comments; 
		return ticket;
	});

	return { ...state, ...{comments, tickets} };
}