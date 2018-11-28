import { AppState } from '@app/core';
import { JiraTicket } from './tickets';
export * from './tickets';

export interface JiraTicketsState {
    loading: boolean;
    tickets: JiraTicket[], 

    additionalLoading: boolean,
    additionalTickets: JiraTicket[],

    commentsLoading: boolean,
    commentsTickets: Array<any>,
    commentsError: string,

    currentJql: string,
    ticketType: string,
    fields: string
}

export interface TicketsState extends AppState {
    jira: JiraTicketsState
}