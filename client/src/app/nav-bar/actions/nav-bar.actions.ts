import { Action } from '@ngrx/store';
import { NavBarItem } from '../nav-bar.model';

export enum NavBarActionTypes {
    RETRIEVE = '[nav-bar] Retrieve',
    RETRIEVE_SUCCESS = '[nav-bar] Retrieve Success',
    RETRIEVE_ERROR = '[nav-bar] Retrieve Error',
}

export class ActionNavBarRetrieve implements Action {
    readonly type = NavBarActionTypes.RETRIEVE;
}
export class ActionNavBarSuccess implements Action {
    readonly type = NavBarActionTypes.RETRIEVE_SUCCESS;
    constructor(readonly payload: NavBarItem[]) { }
}
export class ActionNavBarError implements Action {
    readonly type = NavBarActionTypes.RETRIEVE_ERROR;
    constructor(readonly payload: string) { }
}

export type NavBarActions = ActionNavBarRetrieve | ActionNavBarSuccess | ActionNavBarError;
