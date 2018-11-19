import { AppState } from '@app/core';

export interface JiraTicket {}

export interface JiraState {
    loading: boolean;
    tickets?: JiraTicket[], 
    current_jql: string,
    totalTickets: number
}

export interface State extends AppState {
    jira: JiraState
}