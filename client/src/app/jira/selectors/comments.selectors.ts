import { createSelector, createFeatureSelector } from '@ngrx/store';
import { CommentState, JiraState } from '../models';

const selectJiraState = createFeatureSelector<JiraState>('jira');
export const selectComments = createSelector(selectJiraState, (state: JiraState) => state.comments);
export const selectCommentsTickets = createSelector(selectComments, (state: CommentState) => state.tickets);


