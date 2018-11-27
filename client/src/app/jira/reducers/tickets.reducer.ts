import { 
    TicketsActions, TicketsActionTypes, 
    branchInfoActionTypes, branchInfoActions,
    CommentActionTypes, CommentActions, 
    additionalDetailsActionTypes, additionalDetailsActions
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

type Action = TicketsActions | branchInfoActions | CommentActions | additionalDetailsActions;

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



        case additionalDetailsActionTypes.RETRIEVE:
            return { ...state, additionalLoading: true };
        case additionalDetailsActionTypes.RETRIEVE_SUCCESS:
            const additionalTickets = processJiraTickets(action.payload, state.additionalTickets, state.ticketType);
            return { ...state, additionalLoading: false, additionalTickets};
        case additionalDetailsActionTypes.RETRIEVE_ERROR:
            return { ...state, additionalLoading: false };



        case CommentActionTypes.SAVE_SUCCESS:
            const savedCommentsTickets = addComment(action.payload, state.commentsTickets);
            return { ...state, commentsLoading: false, commentsTickets: savedCommentsTickets};
        case CommentActionTypes.SAVE_ERROR:
            return { ...state, commentsLoading: false };

        case CommentActionTypes.EDIT_SUCCESS:
            const editedCommentsTickets = replaceEditedComment(action.payload, state.commentsTickets);
            return { ...state, commentsLoading: false, commentsTickets: editedCommentsTickets};
        case CommentActionTypes.EDIT_ERROR:
            return { ...state, commentsLoading: false };

        case CommentActionTypes.DELETE_SUCCESS:
            const deletedCommentsTickets = deleteComment(action.payload, state.commentsTickets);
            return { ...state, commentsLoading: false, commentsTickets: deletedCommentsTickets};
        case CommentActionTypes.DELETE_ERROR:
            return { ...state, commentsLoading: false };



        default:
            return state;
    }
}

function deleteComment(deletedCommentId, commentsTickets){

    // find the matching old comment and delete it
    return commentsTickets.map(ticket => {
        ticket = {...ticket};

        const deletedCommentIndex = ticket.comments.findIndex(comment => comment.id === deletedCommentId);
        if(deletedCommentIndex !== -1){
            ticket.comments = Array.from(ticket.comments);
            ticket.comments.splice(deletedCommentIndex, 1);
        }

        return ticket;
    });
}

function replaceEditedComment(newComment, commentsTickets){

    // find the matching old comment and replace it's body
    return commentsTickets.map(ticket => {
        ticket = {...ticket};

        ticket.comments = ticket.comments.map(comment => {
            if(newComment.id === comment.id){
                comment = {...comment};
                comment.comment = newComment.comment;
                comment.raw_comment = newComment.raw_comment;
                comment.updated = newComment.updated;
            }

            return comment;
        });

        return ticket;
    });
}

function addComment(newComment, commentsTickets){

    // add new comment to matching ticket
    return commentsTickets.map(ticket => {
        ticket = {...ticket};
        if(ticket.key === newComment.key) ticket.comments.push(newComment);
        return ticket;
    });
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