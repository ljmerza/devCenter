import { TicketsState, StatusState } from './';

export * from './tickets';
export * from './status';

export type JiraState = {
    tickets: TicketsState,
    statuses: StatusState,
};