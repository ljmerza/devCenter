import { Action } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';

import { NavBarItem } from './nav-bar.model';

export enum NavBarActionTypes {
  RETRIEVE = '[nav-bar] Retrieve',
  RETRIEVE_SUCCESS = '[nav-bar] Retrieve Success',
  RETRIEVE_ERROR = '[nav-bar] Retrieve Error',

  OPEN_TICKET = '[nav-bar] Open Ticket',
  OPEN_TICKET_ERROR = '[nav-bar] Open Ticket Error',

  SEARCH = '[nav-bar] Search',

  PROFILE = '[nav-bar] Profile',
  PROFILE_SUCCESS = '[nav-bar] Profile Success',
  PROFILE_ERROR = '[nav-bar] Profile Error',
}

export class ActionNavBarRetrieve implements Action {
  readonly type = NavBarActionTypes.RETRIEVE;
}
export class ActionNavBarRetrieveSuccess implements Action {
  readonly type = NavBarActionTypes.RETRIEVE_SUCCESS;
  constructor(readonly payload: { navBarItems }) {}
}
export class ActionNavBarRetrieveError implements Action {
  readonly type = NavBarActionTypes.RETRIEVE_ERROR;
}


export class ActionSearch implements Action {
  readonly type = NavBarActionTypes.SEARCH;
  constructor(readonly payload: string) {}
}


export class ActionOpenTicket implements Action {
  readonly type = NavBarActionTypes.OPEN_TICKET;
  constructor(readonly payload: string) {}
}
export class ActionOpenTicketError implements Action {
  readonly type = NavBarActionTypes.OPEN_TICKET_ERROR;
  constructor(readonly payload: string) {}
}


export class ActionProfileRetrieve implements Action {
  readonly type = NavBarActionTypes.PROFILE;
}
export class ActionProfileSuccess implements Action {
  readonly type = NavBarActionTypes.PROFILE_SUCCESS;
  constructor(readonly payload: { profile }) {}
}
export class ActionProfileError implements Action {
  readonly type = NavBarActionTypes.PROFILE_ERROR;
}

export type NavBarActions = ActionSearch
  | ActionOpenTicket
  | ActionOpenTicketError

  | ActionNavBarRetrieve
  | ActionNavBarRetrieveSuccess
  | ActionNavBarRetrieveError

  | ActionProfileRetrieve
  | ActionProfileSuccess
  | ActionProfileError;
