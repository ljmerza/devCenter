import { TicketsActions, TicketsActionTypes, branchInfoActionTypes, branchInfoActions } from '../actions';
import { JiraTicketsState } from '../models';
import { selectJiraTicketFactory } from '../selectors/tickets.selectors';

export const initialState: JiraTicketsState = {
    loading: false,
    tickets: [],
    currentJql: '',
    ticketType: '',
    fields: ''
};

export function TicketsReducer(state: JiraTicketsState = initialState, action: TicketsActions | branchInfoActions): JiraTicketsState {

    switch (action.type) {
        case TicketsActionTypes.RETRIEVE:
            return { ...state, loading: true, ...action.payload };
        case TicketsActionTypes.RETRIEVE_SUCCESS:
            return { ...state, loading: false, tickets: processJiraTickets(action.payload, state)};
        case TicketsActionTypes.RETRIEVE_ERROR:
            return { ...state, loading: false };

        case branchInfoActionTypes.RETRIEVE:
            return { ...state };
        case branchInfoActionTypes.RETRIEVE_SUCCESS:
            return { ...state, tickets: replaceJiraTicket(action.payload, state) };
        case branchInfoActionTypes.RETRIEVE_ERROR:
            return { ...state };

        default:
            return state;
    }
}

/**
 * replaces the matching old jira ticket in the store with the new additional 
 * detailed jira ticket while leaving all the other tickts the same
 * @param {Object} ticket
 * @param {JiraTicketsState} state
 * 
 */
function replaceJiraTicket(newTicket, state) {
    return state.tickets.map(ticket => ticket.key === newTicket.key ? newTicket : ticket);
}

/**
 * add ticketType to all new tickets then replaces any old tickets matching any new tickets
 */
function processJiraTickets(tickets, state){
    const newTickets = tickets.map(ticket => processNewTicket(ticket, state.ticketType));

    const oldTickets = Array.from(state.tickets);

    newTickets.forEach(newTicket => {
        const matchingOldTicketIndex = oldTickets.findIndex((oldTicket:any) => oldTicket.key === newTicket.key);
        if(matchingOldTicketIndex !== -1) oldTickets[matchingOldTicketIndex] = newTicket;
        else oldTickets.push(newTicket);
    });

    return oldTickets;
}

/**
 * 
 * @param {Ticket} ticket
 * @param {string} ticketType
 */
function processNewTicket(ticket, ticketType){
    const copiedTicket = { ...ticket, ticketType, selectorTicket: selectJiraTicketFactory(ticket.key)};

    const devChangeWords = (copiedTicket.dev_changes || copiedTicket.description || '').split(/\n|(\n\r)| /g);
    copiedTicket.pullRequests = getPullRequestsFromDevChanges(devChangeWords);

    const devChangeLines = (copiedTicket.dev_changes || '').split(/\n|(\n\r)/g);
    copiedTicket.pcrCountLeft = getPcrCountLeft(devChangeLines, copiedTicket.story_point);
    
    // if we didn't get pull requests from dev changes field try to get from comments
    if (copiedTicket.pullRequests && copiedTicket.pullRequests.length == 0) {
        copiedTicket.comments.forEach(comment => {
            const devChangeLines = (comment.raw_comment || '').split(/\n|(\n\r)| |\[|\]|\|/g);

            if (copiedTicket.pullRequests.length == 0)
                copiedTicket.pullRequests = getPullRequestsFromDevChanges(devChangeLines);
        });
    }

    return copiedTicket;
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