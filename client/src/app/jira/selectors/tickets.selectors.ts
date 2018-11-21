import { createFeatureSelector, createSelector } from '@ngrx/store';
import { JiraTicketsState, TicketsState } from '../models';

export const selectJiraState = createFeatureSelector<TicketsState, JiraTicketsState>('jira');

export const selectJiraTickets = createSelector(selectJiraState, (state: JiraTicketsState) => state.tickets);
export const selectJiraLoading = createSelector(selectJiraState, (state: JiraTicketsState) => state.loading);

export const selectJiraTicketFactory = (key) => createSelector(selectJiraState, (state: JiraTicketsState) => state.tickets.find((ticket:any) => ticket.key === key));

