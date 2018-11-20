import { JiraActions, JiraActionTypes } from './jira.actions';
import { JiraState } from './jira.model';

export const initialState: JiraState = {
    loading: false,
    tickets: [],
    currentJql: '',
    ticketType: '',
    fields: ''
};

export function JiraReducer(state: JiraState = initialState, action: JiraActions): JiraState {

    switch (action.type) {
        case JiraActionTypes.RETRIEVE:
            return { ...state, loading: true, ...action.payload };
        case JiraActionTypes.RETRIEVE_SUCCESS:
            return { ...state, loading: false, tickets: processJiraTickets(action.payload, state)};
        case JiraActionTypes.RETRIEVE_ERROR:
            return { ...state, loading: false };

        default:
            return state;
    }
}

/**
 * add ticketType to all new tickets then replaces any old tickets matching any new tickets
 */
function processJiraTickets(tickets, state){
    const newTickets = tickets.map(ticket => {
        return {...ticket, ticketType: state.ticketType};
    });

    const oldTickets = Array.from(state.tickets);

    newTickets.forEach(newTicket => {
        const matchingOldTicketIndex = oldTickets.findIndex(oldTicket => oldTicket.key === newTicket.key);
        if(matchingOldTicketIndex !== -1) oldTickets[matchingOldTicketIndex] = newTicket;
        else oldTickets.push(newTicket);
    });

    return oldTickets;
}
