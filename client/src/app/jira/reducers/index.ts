import { combineReducers, ActionReducer } from '@ngrx/store';
import { StatusState, TicketsState, CommentState } from '../models';

import { TicketsReducer } from './tickets.reducer';
import { StatusReducer } from './status.reducer';
import { CommentsReducer } from './comments.reducer';

interface JiraState {
    tickets: TicketsState,
    statuses: StatusState,
    comments: CommentState,
}

const reducers = {
    tickets: TicketsReducer,
    statuses: StatusReducer,
    comments: CommentsReducer,
};

const reducer: ActionReducer<JiraState> = combineReducers(reducers);
function jiraReducer(state: any, action: any) {
    return reducer(state, action);
}

export {TicketsReducer, StatusReducer, CommentsReducer, jiraReducer, StatusState, TicketsState, CommentState };