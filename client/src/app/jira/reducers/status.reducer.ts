import { StatusActionTypes, StatusActions, TicketsActionTypes, TicketsActions } from '../actions';
import { StatusState, StatusTicket, JiraTicket } from '../models';

export const initialStatusState: StatusState = {
    loading: false,
    tickets: [],
    error: '',
};

export function StatusReducer(state: StatusState = initialStatusState, action: StatusActions | TicketsActions): StatusState {
    switch (action.type) {

        case TicketsActionTypes.RETRIEVE_SUCCESS:
            return { ...state, tickets: createStatusTickets(action.payload)};

        case StatusActionTypes.SAVE:
            return { ...state, loading: true };

        case StatusActionTypes.SAVE_SUCCESS:
            return { ...state, loading: false, tickets: updateTicketStatus(action.payload, state.tickets) };

        case StatusActionTypes.SAVE_ERROR:
            return { ...state, loading: false, error: action.payload };

        default:
            return state;
    }
}

/**
 * 
 * @param newStatus 
 * @param statusTickets 
 */
function updateTicketStatus(newStatus, statusTickets): Array<StatusTicket> {
    return statusTickets.map((ticket: StatusTicket) => {
        if (newStatus.key === ticket.key) return newStatus;
        else return ticket;
    });
}

/**
 * 
 * @param tickets 
 */
function createStatusTickets(tickets) {
    return tickets.map((ticket: JiraTicket) => ({
        component: ticket.component,
        status: ticket.status,
        key: ticket.key,
        pcrCountLeft: ticket.pcrCountLeft,
        pullRequests: ticket.pullRequests,
        repoName: ticket.master_branch,
        sprint: ticket.sprint,
        branch: ticket.branch,
        commit: ticket.commit,
        epicLink: ticket.epicLink,
    }));
}
