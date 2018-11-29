import { Action } from '@ngrx/store';

export enum NavBarSearchActionTypes {
    OPEN_TICKET = '[nav-bar] Open Ticket',
    SEARCH = '[nav-bar] Search',
    OPEN_SEARCH_ERROR = '[nav-bar] Search Error',
}

export class ActionSearch implements Action {
    readonly type = NavBarSearchActionTypes.SEARCH;
    constructor(readonly payload: string) { }
}

export class ActionSearchError implements Action {
    readonly type = NavBarSearchActionTypes.OPEN_SEARCH_ERROR;
    constructor(readonly payload: string) { }
}

export class ActionOpenTicket implements Action {
    readonly type = NavBarSearchActionTypes.OPEN_TICKET;
    constructor(readonly payload: string) { }
}


export type NavBarSearchActions = ActionSearch | ActionSearchError | ActionOpenTicket;
