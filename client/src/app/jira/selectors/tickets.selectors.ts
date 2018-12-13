import { createSelector, createFeatureSelector } from '@ngrx/store';
import { TicketsState, JiraState } from '../models';

const selectJiraState = createFeatureSelector<JiraState>('jira');
const selectTickets = createSelector(selectJiraState, (state: JiraState) => state.tickets);
export const selectJiraTickets = createSelector(selectTickets, (state: TicketsState) => state.tickets);
export const selectJiraLoading = createSelector(selectTickets, (state: TicketsState) => state.loading);
