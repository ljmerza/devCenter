import { AppState } from '@app/core';

export interface JiraTicket {}

export interface JiraTicketsState {
    loading: boolean;
    tickets: JiraTicket[], 
    currentJql: string,
    ticketType: string,
    fields: string
}

export interface TicketsState extends AppState {
    jira: JiraTicketsState
}