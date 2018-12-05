import { createSelector } from '@ngrx/store';
import { StatusState, JiraState } from '../models';
import { selectJiraState } from './jira.selectors'; 

export const selectStatuses = createSelector(selectJiraState, (state: JiraState) => state.statuses);
export const selectStatusesTickets = createSelector(selectStatuses, (state: StatusState) => state.tickets);


