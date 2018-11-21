import { Action } from '@ngrx/store';

export enum TicketsActionTypes {
  RETRIEVE = '[jira-tickets] Retrieve',
  RETRIEVE_SUCCESS = '[jira-tickets] Retrieve Success',
  RETRIEVE_ERROR = '[jira-tickets] Retrieve Error',
}

export class ActionTicketsRetrieve implements Action {
    readonly type = TicketsActionTypes.RETRIEVE;
    constructor(readonly payload: { currentJql, fields, ticketType }) {}
}
export class ActionTicketsSuccess implements Action {
    readonly type = TicketsActionTypes.RETRIEVE_SUCCESS;
    constructor(readonly payload: any) { }
}
export class ActionTicketsError implements Action {
    readonly type = TicketsActionTypes.RETRIEVE_ERROR;
}

export type TicketsActions = ActionTicketsRetrieve | ActionTicketsSuccess | ActionTicketsError;
