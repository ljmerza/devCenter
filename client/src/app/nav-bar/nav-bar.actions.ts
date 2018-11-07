import { Action } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';

import { NavBarItem } from './nav-bar.model';

export enum NavBarActionTypes {
  RETRIEVE = '[nav-bar] Retrieve',
  RETRIEVE_SUCCESS = '[nav-bar] Retrieve Success',
  RETRIEVE_ERROR = '[nav-bar] Retrieve Error',
  SEARCH = '[nav-bar] Search',
  SEARCH_SUCCESS = '[nav-bar] Search Success',
  SEARCH_ERROR = '[nav-bar] Search Error',
  OPEN_TICKET = '[nav-bar] Open Ticket'
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
  constructor(readonly payload: { error: HttpErrorResponse }) {}
}


export class ActionSearch implements Action {
  readonly type = NavBarActionTypes.SEARCH;
  constructor(readonly payload: string) {}
}
export class ActionSearchSuccess implements Action {
  readonly type = NavBarActionTypes.SEARCH_SUCCESS;
}
export class ActionSearchError implements Action {
  readonly type = NavBarActionTypes.SEARCH_ERROR;
  constructor(readonly payload: { error: HttpErrorResponse }) {}
}


export class ActionOpenTicket implements Action {
  readonly type = NavBarActionTypes.OPEN_TICKET;
  constructor(readonly payload: string) {}
}

export type NavBarActions =
  | ActionNavBarRetrieve
  | ActionNavBarRetrieveSuccess
  | ActionNavBarRetrieveError
  | ActionSearch
  | ActionSearchSuccess
  | ActionSearchError
  | ActionOpenTicket;
