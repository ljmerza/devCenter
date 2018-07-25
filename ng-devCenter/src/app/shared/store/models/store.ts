import { Ticket, Repo } from '@models';

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