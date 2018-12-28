import { TicketsReducer } from './tickets.reducer';
import { StatusReducer } from './status.reducer';
import { CommentsReducer } from './comments.reducer';

export * from './tickets.reducer';
export * from './status.reducer';
export * from './comments.reducer';

export const jiraReducer = {
    tickets: TicketsReducer,
    statuses: StatusReducer,
    comments: CommentsReducer,
};