import { Ticket } from './models/ticket';
import { Repo } from './models/repo';
import { Actions } from './actions';

import * as commentActions from './reducers/comment-actions';
import * as statusActions from './reducers/status-actions';

export interface RootState {
	tickets: Array<Ticket>,
	repos: Array<Repo>,
	userProfile: any
}

export const initialState: RootState = {
	tickets: [],
	repos: [],
	userProfile: {},
}

/**
 *
 */
export function rootReducer(state, action){
	switch(action.type){
		case Actions.newTickets:
			return { ...state, ...{tickets: action.payload} };
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
			return statusActions.updateStatus(state, action);
		case Actions.updateCrucible:
			return statusActions.updateCrucible(state, action);

		default:
			return state;
	}	
}