import { createSelector, createFeatureSelector } from '@ngrx/store';
import { StatusState, JiraState } from '../models';

const selectJiraState = createFeatureSelector<JiraState>('jira');
export const selectStatuses = createSelector(selectJiraState, (state: JiraState) => state.statuses);
export const selectStatusesTickets = createSelector(selectStatuses, (state: StatusState) => state.tickets);


