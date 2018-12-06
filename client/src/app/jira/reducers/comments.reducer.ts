import { CommentActionTypes, CommentActions, TicketsActionTypes, TicketsActions } from '../actions';
import { CommentState, CommentTicket, JiraTicket } from '../models';

export const initialCommentState: CommentState = {
    loading: false,
    tickets: [],
    error: '',
};

export function CommentsReducer(state: CommentState = initialCommentState, action: CommentActions | TicketsActions): CommentState {
    switch (action.type) {

        case TicketsActionTypes.RETRIEVE_SUCCESS:
            return { ...state, tickets: createCommentsTickets(action.payload)};


        case CommentActionTypes.SAVE_SUCCESS:
            const processedState = processAddLog(action.payload, state.tickets);
            return { ...state, loading: false, ...processedState };

        case CommentActionTypes.SAVE_ERROR:
            return { ...state, loading: false, error: action.payload };


        case CommentActionTypes.EDIT_SUCCESS:
            const editedCommentsTickets = replaceEditedComment(action.payload, state.tickets);
            return { ...state, loading: false, tickets: editedCommentsTickets };

        case CommentActionTypes.EDIT_ERROR:
            return { ...state, loading: false };


        case CommentActionTypes.DELETE_SUCCESS:
            const deletedCommentsTickets = deleteComment(action.payload, state.tickets);
            return { ...state, loading: false, tickets: deletedCommentsTickets };

        case CommentActionTypes.DELETE_ERROR:
            return { ...state, loading: false };

        default:
            return state;
    }
}

/**
 * creates the base comment tickets list
 * @param tickets 
 */
function createCommentsTickets(tickets): CommentTicket[] {
    return tickets.map((ticket: JiraTicket) => ({
        msrp: ticket.msrp,
        key: ticket.key,
        comments: ticket.comments,
        attachments: ticket.attachments || [],
        dates: ticket.dates,
    }));
}

/**
 * deletes a comment for a ticket
 * @param deletedCommentId 
 * @param tickets
 */
function deleteComment(deletedComment, tickets) {

    // find matching ticket then matching comment of that ticket
    return tickets.map(ticket => {

        if (ticket.key === deletedComment.key){
            ticket = { ...ticket };

            const deletedCommentIndex = ticket.comments.findIndex(comment => comment.id === deletedComment.comment_id);
            if (deletedCommentIndex !== -1) {
                ticket.comments = Array.from(ticket.comments);
                ticket.comments.splice(deletedCommentIndex, 1);
            }
        }

        return ticket;
    });
}

/**
 * 
 * @param newComment 
 * @param tickets
 */
function replaceEditedComment(newComment, tickets) {

    // find the matching old comment and replace it's body
    return tickets.map(ticket => {

        if (ticket.key === newComment.key) {
            ticket = { ...ticket };

            ticket.comments = ticket.comments.map(comment => {
                if (newComment.id === comment.id) {
                    comment = { ...comment };
                    comment.comment = newComment.comment;
                    comment.raw_comment = newComment.raw_comment;
                    comment.updated = newComment.updated;
                }

                return comment;
            });
        }

        return ticket;
    });
}

/**
 * 
 * @param addLogResponse 
 * @param tickets
 */
function processAddLog(addLogResponse, tickets) {
    const newTickets = { tickets };

    // add new comment if successful
    if (addLogResponse.comment_response.status) {
        newTickets.tickets = tickets.map(ticket => {
            ticket = { ...ticket };

            if (ticket.key === addLogResponse.key) {
                ticket.comments = Array.from(ticket.comments);
                const newComment = addLogResponse.comment_response.data;
                ticket.comments.push(newComment);
            }

            return ticket;
        });
    }

    // add work-log if successful
    if (addLogResponse.log_response.status) {
        newTickets.tickets = tickets.map(ticket => {
            ticket = { ...ticket };

            if (ticket.key === addLogResponse.key) {
                const timeSpentSeconds = addLogResponse.log_response.data.timeSpentSeconds;
                ticket.logged_seconds = parseInt(ticket.logged_seconds) + timeSpentSeconds || 0;
            }

            return ticket;
        });
    }

    // // change status if merge conflict successful
    // if(addLogResponse.conflict_response.status){
    //     const newStatus = addLogResponse.conflict_response.data;

    // }

    // // change status if merge successful
    // if(addLogResponse.merge_response.status){
    //     const newStatus = addLogResponse.merge_response.data;

    // }

    return newTickets;
}
