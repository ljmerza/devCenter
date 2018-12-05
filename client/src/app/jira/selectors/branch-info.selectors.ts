import { createSelector } from '@ngrx/store';
import { TicketsState, JiraState } from '../models';
import { selectJiraState } from './jira.selectors';

const selectTickets = createSelector(selectJiraState, (state: JiraState) => state.tickets);
export const selectJiraAdditionalTickets = createSelector(selectTickets, (state: TicketsState) => state.additionalTickets);
export const selectJiraAdditionalLoading = createSelector(selectTickets, (state: TicketsState) => state.additionalLoading);


