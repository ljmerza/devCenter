import { 
    TicketsActions, TicketsActionTypes,
    branchInfoActions,
    additionalDetailsActionTypes, additionalDetailsActions,
} from '../actions';

import { purgeOldTickets } from './purge.tools';
import { TicketsState, JiraTicket } from '../models';
import { selectJiraTicketFactory } from '../selectors/tickets.selectors';

export const initialTicketsState: TicketsState = {
    loading: false,
    tickets: [],
    error: '',
    
    additionalLoading: false,
    additionalTickets: [],
    additionalError: '',

    currentJql: '',
    ticketType: '',
    fields: ''
};

type Action = TicketsActions | branchInfoActions | additionalDetailsActions;

export function TicketsReducer(state: TicketsState = initialTicketsState, action: Action): TicketsState {
    
    switch (action.type) {

        case TicketsActionTypes.RETRIEVE:
            return { ...state, loading: true, ...action.payload };

        case TicketsActionTypes.RETRIEVE_SUCCESS:
            const tickets = processJiraTickets(action.payload, state.tickets, action.payload.ticketType);
            return { ...state, loading: false, tickets };

        case TicketsActionTypes.RETRIEVE_ERROR:
            return { ...state, loading: false };


        case additionalDetailsActionTypes.RETRIEVE:
            return { ...state, additionalLoading: true };

        case additionalDetailsActionTypes.RETRIEVE_SUCCESS:
            const additionalTickets = processJiraTickets(action.payload, state.additionalTickets, state.ticketType);
            return { ...state, additionalLoading: false, additionalTickets};

        case additionalDetailsActionTypes.RETRIEVE_ERROR:
            return { ...state, additionalLoading: false };


        default:
            return state;
    }
}

 /**
  * add ticketType to all new tickets then replaces any old tickets matching any new tickets
  * @param tickets 
  * @param oldTickets 
  * @param ticketType 
  */
function processJiraTickets(tickets, oldTickets, ticketType): JiraTicket[] {
    
    const newTickets = tickets.map(ticket => processNewTicket(ticket, ticketType));
    const newTicketState = <JiraTicket[]>Array.from(oldTickets);
    
    // first merge all new tickets into the master list - keep track of all keys for new tickets to purge old ticket
    newTickets.forEach(newTicket => {
        const matchingOldTicketIndex = newTicketState.findIndex((oldTicket: JiraTicket) => oldTicket.key === newTicket.key);
        if (matchingOldTicketIndex !== -1) newTicketState[matchingOldTicketIndex] = newTicket;
        else newTicketState.push(newTicket);
    });
    
    // filter out any left over tickets before returning new list
    return purgeOldTickets(newTickets, newTicketState, ticketType);
}

/**
 * adds a selector for the ticket itself
 * @param {Ticket} ticket
 * @param {string} ticketType
 */
function processNewTicket(ticket, ticketType){
    return { ...ticket, ticketType, selectorTicket: selectJiraTicketFactory(ticket.key)};
}