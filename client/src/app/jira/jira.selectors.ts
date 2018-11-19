import { createFeatureSelector, createSelector } from '@ngrx/store';
import { JiraState, State } from './jira.model';

export const selectJiraState = createFeatureSelector<State, JiraState>('jira');

export const selectJiraTickets = createSelector(selectJiraState, (state: JiraState) => state.tickets);
export const selectJiraLoading = createSelector(selectJiraState, (state: JiraState) => state.loading);

