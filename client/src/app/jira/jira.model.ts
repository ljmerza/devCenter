import { AppState } from '@app/core';

export interface JiraTicket {}

export interface JiraState {
    loading: boolean;
    tickets?: JiraTicket[], 
    currentJql: string,
    ticketType: string,
    fields: string
}

export interface State extends AppState {
    jira: JiraState
}