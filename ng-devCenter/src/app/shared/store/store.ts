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
	orders: Array<any>,
	ticketType: string,
	devstats: Array<any>
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
	orders: [],
	ticketType: '',
	devstats: []
}

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
		case Actions.updateCrucible:
			return updateCrucible(state, action.payload);

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

/**
 *
 */
function addTickets(state, tickets){
	let comments = [];
	let crucibles = [];
	let statuses = [];
	let dates = [];

	tickets.forEach(ticket => {
		comments.push({
			comments: ticket.comments,
			key: ticket.key,
			msrp: ticket.msrp
		});

		crucibles.push({
			crucible_id: ticket.crucible_id,
			key: ticket.key,
			msrp: ticket.msrp
		});

		statuses.push({
			status: ticket.status,
			key: ticket.key,
			msrp: ticket.msrp
		});
	});



	const ticketType = state.ticketType || 'other'

	const newState = {
		[ticketType]: tickets,
		[`${ticketType}_comments`]: comments,
		[`${ticketType}_crucible`]: crucibles,
		[`${ticketType}_statuses`]: statuses,
		[`${ticketType}_dates`]: dates
	};


	return { ...state, ...newState };
}