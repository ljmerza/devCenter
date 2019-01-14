import {CommentActionTypes, CommentActions, TicketsActionTypes, TicketsActions} from '../actions';
import {CommentState, CommentTicket, Comment} from '../models';
import {purgeOldTickets, processNewTicket} from './purge.tools';

export const initialCommentState: CommentState = {
	loading: false,
	tickets: [],
	error: '',
};

export function CommentsReducer(state: CommentState = initialCommentState, action: CommentActions | TicketsActions): CommentState {
	switch (action.type) {
		case TicketsActionTypes.RETRIEVE_SUCCESS:
			return {...state, tickets: processCommentTickets(action.payload, state.tickets, action.payload.ticketType)};

		case CommentActionTypes.SAVE_SUCCESS:
			return {...state, loading: false, tickets: processAddLog(action.payload, state.tickets)};

		case CommentActionTypes.SAVE_ERROR:
			return {...state, loading: false, error: action.payload};

		case CommentActionTypes.EDIT_SUCCESS:
			return {...state, loading: false, tickets: replaceEditedComment(action.payload, state.tickets)};

		case CommentActionTypes.EDIT_ERROR:
			return {...state, loading: false};

		case CommentActionTypes.DELETE_SUCCESS:
			return {...state, loading: false, tickets: deleteComment(action.payload, state.tickets)};

		case CommentActionTypes.DELETE_ERROR:
			return {...state, loading: false};

		default:
			return state;
	}
}

/**
 * adds any new status ticket and replaces any old ones
 * @param tickets
 * @param oldTickets
 */
function processCommentTickets(tickets, oldTickets, ticketType): CommentTicket[] {
	const newTickets = tickets.map(ticket => processNewTicket(ticket, ticketType));
	const newTicketState = <CommentTicket[]>Array.from(oldTickets);

	newTickets.forEach(newTicket => {
		const matchingOldTicketIndex = newTicketState.findIndex((oldTicket: CommentTicket) => oldTicket.key === newTicket.key);
		newTicket = createCommentsTickets(newTicket, ticketType);

		if (matchingOldTicketIndex !== -1) newTicketState[matchingOldTicketIndex] = newTicket;
		else newTicketState.push(newTicket);
	});

	return purgeOldTickets(newTickets, newTicketState, ticketType);
}

/**
 * creates the base comment tickets list
 * @param tickets
 */
function createCommentsTickets(ticket, ticketType): CommentTicket {
	return {
		msrp: ticket.msrp,
		key: ticket.key,
		comments: ticket.comments.map(processComment),
		attachments: ticket.attachments || [],
		dates: ticket.dates,
		ticketType: ticketType,
	};
}

/**
 * edit a jira comment for the UI
 * @param comment
 * @param comment
 */
function processComment(comment): Comment {
	comment = {...comment};
	comment.visibilityName = comment.visibility || 'Public';
	comment.isVisible = !!comment.visibility;
	return comment;
}

/**
 * deletes a comment for a ticket
 * @param deletedCommentId
 * @param tickets
 */
function deleteComment(deletedComment, tickets) {
	// find matching ticket then matching comment of that ticket
	return tickets.map(ticket => {
		if (ticket.key === deletedComment.key) {
			ticket = {...ticket};

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
			ticket = {...ticket};

			ticket.comments = ticket.comments.map(comment => {
				if (newComment.id === comment.id) {
					comment = {...comment};
					comment.comment = newComment.comment;
					comment.raw_comment = newComment.raw_comment;
					comment.updated = newComment.updated;
					comment = processComment(newComment);
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
	let newTickets: CommentTicket[] = Array.from(tickets);

	// add new comment if successful
	if (addLogResponse.comment_response && addLogResponse.comment_response.status) {
		newTickets = newTickets.map((ticket: CommentTicket) => {
			if (ticket.key === addLogResponse.key) {
				ticket = {...ticket};
				ticket.comments = Array.from(ticket.comments);
				const newComment = processComment(addLogResponse.comment_response.data);
				ticket.comments.push(newComment);
			}

			return ticket;
		});
	}

	// add work-log if successful
	if (addLogResponse.log_response && addLogResponse.log_response.status) {
		newTickets = newTickets.map((ticket: CommentTicket) => {
			if (ticket.key === addLogResponse.key) {
				ticket = {...ticket};
				ticket.dates = {...ticket.dates};
				const timeSpentSeconds = addLogResponse.log_response.data.timeSpentSeconds;
				ticket.dates.logged_seconds = ticket.dates.logged_seconds + timeSpentSeconds || 0;
			}

			return ticket;
		});
	}

	return newTickets;
}
