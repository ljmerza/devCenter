import { combineReducers } from '@ngrx/store';

import { TicketsReducer } from './tickets.reducer';
import { StatusReducer } from './status.reducer';
import { CommentsReducer } from './comments.reducer';

import { JiraState } from '../models';

export * from './tickets.reducer';
export * from './status.reducer';
export * from './comments.reducer';



export const jiraReducer = combineReducers<JiraState>({
    tickets: TicketsReducer,
    statuses: StatusReducer,
    comments: CommentsReducer,
});