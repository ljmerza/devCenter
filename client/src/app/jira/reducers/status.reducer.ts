import { 
    StatusActionTypes, StatusActions, TicketsActionTypes, TicketsActions ,
    QaGeneratorActionTypes, QaGeneratorActions
} from '../actions';

import { StatusState, StatusTicket } from '../models';
import { purgeOldTickets, processNewTicket } from './purge.tools';

export const initialStatusState: StatusState = {
    loading: false,
    tickets: [],
    error: '',
    allStatuses: []
};

export function StatusReducer(state: StatusState = initialStatusState, action: StatusActions | TicketsActions | QaGeneratorActions): StatusState {
    
    switch (action.type) {

        case QaGeneratorActionTypes.SAVE_QA:
            return { ...state, loading: true, error: '' };
        case QaGeneratorActionTypes.SAVE_QA_SUCCESS:
            return { ...state, error: '', tickets: processPullRequests(action.payload, state.tickets) };
        case QaGeneratorActionTypes.SAVE_QA_ERROR:
            return { ...state, loading: false, error: action.payload };


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
 * adds any pull requests to a ticket
 * @param pullRequests the pull requests response
 * @param oldTickets original ticket state
 */
function processPullRequests(pullRequests, oldTickets){
    if (pullRequests.length === 0) return oldTickets;
    
    let newTicketState = <StatusTicket[]>Array.from(oldTickets);

    newTicketState = newTicketState.map(ticket => {
        if (ticket.key === pullRequests.key){
            ticket = { ...ticket};
            ticket.pullRequests = pullRequests;
        }

        return ticket;
    });

    return newTicketState;
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
        const newStatusTicket = createStatusTicket(newTicket);

        if (matchingOldTicketIndex !== -1) {
            newTicketState[matchingOldTicketIndex] = newStatusTicket;
        } else {
            newTicketState.push(newStatusTicket);
        }
    });

    return purgeOldTickets(newTickets, newTicketState, ticketType);
}

/**
 * creates a new status ticket
 * @param tickets 
 */
function createStatusTicket(ticket): StatusTicket {
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
        fullStatus: ticket.full_status,
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
        transitions: processTransitions(ticket.transitions, ticket.status, ticket.component)
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
            ticket.status = newStatusTicket.status;
            ticket.component = newStatusTicket.component;
            ticket.fullStatus = newStatusTicket.full_status;
            ticket.transitions = processTransitions(newStatusTicket.transitions, newStatusTicket.status, newStatusTicket.component);
            
            if (newStatusTicket.pullRequests){
                ticket.pullRequests = newStatusTicket.pullRequests;
            }
        };

        return ticket;
    });
}

/**
 * customize a ticket's transitions
 * @param {Transition[]} transitions
 * @return {Transition[]}
 */
function processTransitions(transitions = [], status='', component=''){
    let newTransitions = transitions.filter(transition => {
        if(['Closed', 'On Hold', 'UAT', 'Backlog'].includes(transition.name)) return false;
        if (status === 'In Development' && ['CR Ready', 'In Sprint'].includes(transition.name)) return false;
        if (status === 'Merge Code' && ['In UAT'].includes(transition.name)) return false;
        
        return true;
    });

    const currentStatus = component || status;

    if (['In PCR'].includes(currentStatus)) {
        newTransitions.unshift({ name: 'PCR - Needed' });
    }

    if (['PCR - Needed'].includes(currentStatus)) {
        newTransitions.unshift({ name: 'PCR - Working' });
    }

    if (['In QA', 'In PCR'].includes(currentStatus)) {
        newTransitions.push({ name: 'Merge Conflict' });
    }

    // if current status is component then add remove component status
    if (!!component) {
        newTransitions.unshift({ name: `Remove ${currentStatus}` });
    }

    if (['API Defect'].includes(currentStatus)) {
        newTransitions = [];
    }

    return newTransitions;
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
