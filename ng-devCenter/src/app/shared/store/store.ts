import { Ticket, Comment, Repo } from '@models';

import { 
	addComment, deleteComment, editComment, 
	updateStatus, updatePullRequests, updateWorklog, 
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

/**
 * adds a list of ticket to the store. Adds them based on the type of list we are trying to retrieve
 */
function addTickets(state, tickets){
	let comments = [];
	let codeClouds = [];
	let statuses = [];
	let dates = [];

	// extract pull requests
	tickets = tickets.map(ticket => {
		const devChangeLines = (ticket.dev_changes || '').split(/\n | /g);

		const pullRequests = devChangeLines
			.filter(request => request.startsWith('http'))
			.map(request => request.trimStart());

		ticket.pullRequests = pullRequests.map(request => {
			request = request.split('\n')[0]; // make sure we only have the url
			const repo = /repos\/(\w+)(\/pull-requests)|(commit)/.exec(request);
			return {repo: (repo && repo[1]) || 'Unknown Repo', link: request};
		});

		return ticket;
	});

	tickets.forEach(ticket => {
		comments.push({
			comments: ticket.comments,
			key: ticket.key,
			msrp: ticket.msrp
		});

		codeClouds.push({
			key: ticket.key,
			msrp: ticket.msrp,
			pullRequests: ticket.pullRequests
		});

		statuses.push({
			status: ticket.status,
			key: ticket.key,
			msrp: ticket.msrp,
			master_branch: ticket.master_branch || ''
		});
	});



	const ticketType = state.ticketType || 'other'

	const newState = {
		[ticketType]: tickets,
		[`${ticketType}_comments`]: comments,
		[`${ticketType}_codeCloud`]: codeClouds,
		[`${ticketType}_statuses`]: statuses,
		[`${ticketType}_dates`]: dates
	};


	return { ...state, ...newState };
}