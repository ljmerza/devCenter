import { StatusActionTypes, StatusActions, TicketsActionTypes, TicketsActions } from '../actions';
import { StatusState, StatusTicket } from '../models';
import { purgeOldTickets, processNewTicket } from './purge.tools';

export const initialStatusState: StatusState = {
    loading: false,
    tickets: [],
    error: '',
    allStatuses: []
};

export function StatusReducer(state: StatusState = initialStatusState, action: StatusActions | TicketsActions): StatusState {
    switch (action.type) {

        case TicketsActionTypes.RETRIEVE_SUCCESS:
            return { ...state, tickets: processStatusTickets(action.payload, state.tickets, action.payload.ticketType) };

        case StatusActionTypes.SAVE:
            return { ...state, loading: true, error: '' };

        case StatusActionTypes.SAVE_SUCCESS:
            return { ...state, error: '', loading: false, tickets: updateTicketStatus(action.payload, state.tickets) };

        case StatusActionTypes.SAVE_ERROR:
            return { ...state, loading: false, error: action.payload };

        default:
            return state;
    }
}

/**
 * adds any new status ticket and replaces any old ones
 * @param tickets 
 * @param oldTickets 
 */
function processStatusTickets(tickets, oldTickets, ticketType): StatusTicket[] {
    const newTickets = tickets.map(ticket => processNewTicket(ticket, ticketType));
    const newTicketState = <StatusTicket[]>Array.from(oldTickets);

    newTickets.forEach(newTicket => {
        const matchingOldTicketIndex = newTicketState.findIndex((oldTicket: StatusTicket) => oldTicket.key === newTicket.key);
        newTicket = createStatusTickets(newTicket);

        if (matchingOldTicketIndex !== -1) newTicketState[matchingOldTicketIndex] = newTicket;
        else newTicketState.push(newTicket);
    });

    return purgeOldTickets(newTickets, newTicketState, ticketType);
}

/**
 * creates a new status ticket
 * @param tickets 
 */
function createStatusTickets(ticket): StatusTicket {
    ticket = { ...ticket };

    const devChangeWords = (ticket.dev_changes || ticket.description || '').split(/\n|(\n\r)| /g);
    let pullRequests = getPullRequestsFromDevChanges(devChangeWords);

    const devChangeLines = (ticket.dev_changes || '').split(/\n|(\n\r)/g);
    let pcrCountLeft = getPcrCountLeft(devChangeLines, ticket.story_point);

    // if we didn't get pull requests from dev changes field try to get from comments
    if (pullRequests && pullRequests.length == 0) {
        ticket.comments.forEach(comment => {
            const devChangeLines = (comment.raw_comment || '').split(/\n|(\n\r)| |\[|\]|\|/g);

            if (pullRequests.length == 0)
                pullRequests = getPullRequestsFromDevChanges(devChangeLines);
        });
    }

    return {
        pullRequests,
        pcrCountLeft,
        component: ticket.component,
        status: ticket.status,
        key: ticket.key,
        msrp: ticket.msrp,
        repoName: ticket.master_branch,
        sprint: ticket.sprint,
        branch: ticket.branch,
        commit: ticket.commit,
        epicLink: ticket.epicLink,
        ticketType: ticket.ticketType,
        storyPoint: ticket.story_point,
        summary: ticket.summary,
    };
}

/**
 * update the matching ticket status and component
 * @param newStatus 
 * @param statusTickets 
 */
function updateTicketStatus(newStatusTicket, statusTickets: StatusTicket[]): StatusTicket[] {
    
    return statusTickets.map((ticket: StatusTicket) => {
        if (newStatusTicket.key === ticket.key) {
            ticket = { ...ticket };
            ticket.status = newStatusTicket.new_status.status;
            ticket.component = newStatusTicket.new_status.component;
            
            if (newStatusTicket.pullRequests){
                ticket.pullRequests = newStatusTicket.pullRequests;
            }
        };

        return ticket;
    });
}

/**
 * 
 * @param devChangeLines 
 */
function getPullRequestsFromDevChanges(devChangeLines) {
    const pullRequests = devChangeLines
        .filter(request => {
            return request &&
                request.startsWith('http')
                && (request.includes('pull-request') || request.includes('compare/commits'))
        })
        .map(request => request.trimStart());

    return getPullRequests(pullRequests);
}

/**
 * 
 * @param pullRequests 
 */
export function getPullRequests(pullRequests) {
    return pullRequests.map(request => {
        request = request.split('\n')[0]; // make sure we only have the url

        let repo = /repos\/(\w+)\/pull-requests/.exec(request);
        let repoName = repo && repo[1];
        let requestId;

        // if we found a repo name then is a pull request 
        // else we found a diff link
        if (repoName) {
            requestId = /pull-requests\/(\w+)\/?/.exec(request);
        } else {
            repo = /repos\/(\w+)\/compare\/commits/.exec(request);
            repoName = repo && repo[1];
            if (repoName) repoName += ' (Diff Link)';
        }

        return {
            repo: repoName || 'Unknown Repo',
            link: request,
            requestId: (requestId && requestId[1]) || ''
        };
    });
}

/**
 * 
 * @param devChangeLines 
 * @param storyPoint 
 */
function getPcrCountLeft(devChangeLines, storyPoint) {

    // get any lines that might have pcr needed
    const pcrRemaining = devChangeLines.find(line => line && /PCR/i.test(line) && !/Pull Request/i.test(line));
    if (!pcrRemaining) return;

    // get only the numbers
    const potentialPcrs = pcrRemaining.replace(/\D/g, '');
    if ((potentialPcrs !== 0 && !potentialPcrs) || isNaN(potentialPcrs)) return;

    // get the PCR needed for the ticket - if smaller  
    // then most likely PCR remaining else definitely not
    const pcrNeeded = Math.ceil(storyPoint / 2);
    if (pcrNeeded < potentialPcrs) return;
    else return potentialPcrs;
}
