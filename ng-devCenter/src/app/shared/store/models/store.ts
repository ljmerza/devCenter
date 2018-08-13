import { Ticket, Repo } from '@models';

export interface RootState {
	tickets: Array<Ticket>,
	repos: Array<Repo>,
	userProfile: any,
	allopen: Array<any>,
	mytickets: Array<any>,
	pcr: Array<any>,
	qa: Array<any>,
	cr: Array<any>,
	uctready: Array<any>,
	myWatchedTicket: Array<any>,
	beta: Array<any>,
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