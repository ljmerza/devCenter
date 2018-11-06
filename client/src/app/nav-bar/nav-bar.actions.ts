import { Action } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';

import { NavBarItem } from './nav-bar.model';

export enum NavBarActionTypes {
  RETRIEVE = '[nav-bar] Retrieve',
  RETRIEVE_SUCCESS = '[nav-bar] Retrieve Success',
  RETRIEVE_ERROR = '[nav-bar] Retrieve Error'
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

export type NavBarActions =
  | ActionNavBarRetrieve
  | ActionNavBarRetrieveSuccess
  | ActionNavBarRetrieveError;
