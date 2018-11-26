import { createFeatureSelector, createSelector } from '@ngrx/store';
import { JiraTicketsState, TicketsState } from '../models';

const selectJiraState = createFeatureSelector<TicketsState, JiraTicketsState>('jira');

export const selectJiraAdditionalTickets = createSelector(selectJiraState, (state: JiraTicketsState) => state.additionalTickets);
export const selectJiraAdditionalLoading = createSelector(selectJiraState, (state: JiraTicketsState) => state.additionalLoading);


