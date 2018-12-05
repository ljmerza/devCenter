import { createFeatureSelector, createSelector } from '@ngrx/store';
import { JiraState } from '../models';

export const selectJiraState = createFeatureSelector<JiraState>('jira');
export const selectTickets = createSelector(selectJiraState, (state: JiraState) => state.tickets);
