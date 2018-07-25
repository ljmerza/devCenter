import { 
	addComment, deleteComment, editComment, addOrders,
	updateStatus, updatePullRequests, updateWorklog
} from './reducers';

import { Actions } from './actions';
import { addTickets } from './add-tickets';

/**
 *
 */
export function rootReducer(state, action){
	// add type of list so we can filter out actions in app based on list type
	if(action.payload && typeof action.payload !== 'string') action.payload.listType = action.type;

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
		case Actions.updatePullRequests:
			return updatePullRequests(state, action.payload);

		case Actions.updateWorklog:
			return updateWorklog(state, action.payload);

		case Actions.newOrders:
			return addOrders(state, action.payload);

		case Actions.ticketType:
			return { ...state, ...{ticketType:action.payload} };

		default:
			return state;
	}	
}