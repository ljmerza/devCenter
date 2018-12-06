import { TicketsState, StatusState, CommentState } from './';

export * from './tickets';
export * from './status';
export * from './comments';

export type JiraState = {
    tickets: TicketsState,
    statuses: StatusState,
    comments: CommentState,
};