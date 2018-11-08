import { Action } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';

import { NavBarItem } from './nav-bar.model';

export enum NavBarActionTypes {
  RETRIEVE = '[nav-bar] Retrieve',
  RETRIEVE_SUCCESS = '[nav-bar] Retrieve Success',
  SEARCH = '[nav-bar] Search',
  SEARCH_SUCCESS = '[nav-bar] Search Success',
  OPEN_TICKET = '[nav-bar] Open Ticket',
  PROFILE = '[nav-bar] Profile',
  PROFILE_SUCCESS = '[nav-bar] Profile Success'
}

export class ActionNavBarRetrieve implements Action {
  readonly type = NavBarActionTypes.RETRIEVE;
}
export class ActionNavBarRetrieveSuccess implements Action {
  readonly type = NavBarActionTypes.RETRIEVE_SUCCESS;
  constructor(readonly payload: { navBarItems }) {}
}


export class ActionSearch implements Action {
  readonly type = NavBarActionTypes.SEARCH;
  constructor(readonly payload: string) {}
}
export class ActionSearchSuccess implements Action {
  readonly type = NavBarActionTypes.SEARCH_SUCCESS;
}

export class ActionOpenTicket implements Action {
  readonly type = NavBarActionTypes.OPEN_TICKET;
  constructor(readonly payload: string) {}
}


export class ActionProfileRetrieve implements Action {
  readonly type = NavBarActionTypes.PROFILE;
}
export class ActionProfileSuccess implements Action {
  readonly type = NavBarActionTypes.PROFILE_SUCCESS;
  constructor(readonly payload: { profile }) {}
}

export type NavBarActions =
  | ActionNavBarRetrieve
  | ActionNavBarRetrieveSuccess
  | ActionSearch
  | ActionSearchSuccess
  | ActionOpenTicket
  | ActionProfileRetrieve
  | ActionProfileSuccess;
