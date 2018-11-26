import { 
    TicketsActions, TicketsActionTypes, 
    branchInfoActionTypes, branchInfoActions,
    CommentActionTypes, CommentActions,
} from '../actions';
import { JiraTicketsState, JiraTicket } from '../models';
import { selectJiraTicketFactory } from '../selectors/tickets.selectors';

export const initialState: JiraTicketsState = {
    loading: false,
    tickets: [],

    additionalLoading: false,
    additionalTickets: [],

    commentsLoading: false,
    commentsTickets: [],

    currentJql: '',
    ticketType: '',
    fields: ''
};

type Action = TicketsActions | branchInfoActions | CommentActions;

export function TicketsReducer(state: JiraTicketsState = initialState, action: Action): JiraTicketsState {

    switch (action.type) {
        case TicketsActionTypes.RETRIEVE:
            return { ...state, loading: true, ...action.payload };

        case TicketsActionTypes.RETRIEVE_SUCCESS:
            const tickets = processJiraTickets(action.payload, state.tickets, state.ticketType);
            const commentsTickets = tickets.map((ticket:JiraTicket) => ({
                msrp: ticket.msrp, 
                key:ticket.key, 
                comments: ticket.comments,
                attachments: ticket.attachments || [],
            }));
            return { ...state, loading: false, tickets, commentsTickets };

        case TicketsActionTypes.RETRIEVE_ERROR:
            return { ...state, loading: false };



        case branchInfoActionTypes.RETRIEVE:
            return { ...state, additionalLoading: true };

        case branchInfoActionTypes.RETRIEVE_SUCCESS:
            const additionalTickets = processJiraTickets(action.payload, state.additionalTickets, state.ticketType);
            return { ...state, additionalLoading: false, additionalTickets};
        
        case branchInfoActionTypes.RETRIEVE_ERROR:
            return { ...state, additionalLoading: false };


        case CommentActionTypes.SAVE:
            return { ...state, additionalLoading: true };

        case CommentActionTypes.SAVE_SUCCESS:
            return { ...state, additionalLoading: false };
        
        case CommentActionTypes.SAVE_ERROR:
            return { ...state, additionalLoading: false };

        default:
            return state;
    }
}

/**
 * add ticketType to all new tickets then replaces any old tickets matching any new tickets
 */
function processJiraTickets(tickets, oldTickets, ticketType): JiraTicket[] {
    const newTickets = tickets.map(ticket => processNewTicket(ticket, ticketType));
    const oldTicketsCopied = <JiraTicket[]>Array.from(oldTickets);

    newTickets.forEach(newTicket => {
        const matchingOldTicketIndex = oldTicketsCopied.findIndex((oldTicket: JiraTicket) => oldTicket.key === newTicket.key);
        if (matchingOldTicketIndex !== -1) oldTicketsCopied[matchingOldTicketIndex] = newTicket;
        else oldTicketsCopied.push(newTicket);
    });

    return oldTicketsCopied;
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