import { createFeatureSelector, createSelector } from '@ngrx/store';
import { JiraTicketsState, TicketsState } from '../models';

const selectJiraState = createFeatureSelector<TicketsState, JiraTicketsState>('jira');
export const selectDatesTickets = createSelector(selectJiraState, (state: JiraTicketsState) => state.datesTickets);


