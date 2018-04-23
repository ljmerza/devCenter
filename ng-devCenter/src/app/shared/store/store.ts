import { Ticket, Comment, Repo } from '@models';

import { 
	addComment, deleteComment, editComment, 
	updateStatus, updateCrucible, updateWorklog, 
	addOrders 
} from './reducers';

import { Actions } from './actions';

export interface RootState {
	tickets: Array<Ticket>,
	repos: Array<Repo>,
	userProfile: any,
	allopen: any,
	mytickets: any,
	pcr: any,
	qa: any,
	cr: any,
	uctready: any,
	myWatchedTicket: any,
	beta: any,
	orders: Array<any>
}

export const initialState: RootState = {
	tickets: [],
	repos: [],
	userProfile: {},
	allopen: [],
	mytickets: [],
	pcr: [],
	qa: [],
	cr: [],
	uctready: [],
	myWatchedTicket: [],
	beta: [],
	orders: []
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

		case Actions.updateWorklog:
			return updateWorklog(state, action.payload);

		case Actions.newOrders:
			return addOrders(state, action.payload);

		default:
			return state;
	}	
}

/**
 *
 */
function addTickets(state, tickets){
	return { ...state, ...{[tickets.ticketListType || 'other']: tickets} };
}