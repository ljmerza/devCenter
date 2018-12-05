import { createSelector } from '@ngrx/store';
import { TicketsState, JiraState } from '../models';
import { selectJiraState } from './jira.selectors';

const selectTickets = createSelector(selectJiraState, (state: JiraState) => state.tickets);
export const selectJiraTickets = createSelector(selectTickets, (state: TicketsState) => state.tickets);
export const selectJiraLoading = createSelector(selectTickets, (state: TicketsState) => state.loading);

export const selectJiraTicketFactory = (key) => 
    createSelector(selectTickets, (state: TicketsState) => state.tickets.find((ticket:any) => ticket.key === key));

