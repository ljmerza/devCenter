import { Action } from '@ngrx/store';

export enum NavBarStatusActionTypes {
    STATUS = '[nav-bar] Status',
    STATUS_SUCCESS = '[nav-bar] Status Success',
    STATUS_ERROR = '[nav-bar] Status Error'
}

export class ActionStatusRetrieve implements Action {
    readonly type = NavBarStatusActionTypes.STATUS;
}
export class ActionStatusSuccess implements Action {
    readonly type = NavBarStatusActionTypes.STATUS_SUCCESS;
    constructor(readonly payload: any) { }
}
export class ActionStatusError implements Action {
    readonly type = NavBarStatusActionTypes.STATUS_ERROR;
    constructor(readonly payload: string) { }
}

export type NavBarStatusActions = ActionStatusRetrieve | ActionStatusSuccess | ActionStatusError;
