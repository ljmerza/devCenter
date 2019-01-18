import { Action } from '@ngrx/store';

export enum StatusActionTypes {
    SAVE = '[jira-status] Save',
    SAVE_SUCCESS = '[jira-status] Save Success',
    SAVE_ERROR = '[jira-status] Save Error',
}

export class ActionStatusSave implements Action {
    readonly type = StatusActionTypes.SAVE;
    constructor(readonly payload: any) { }
}
export class ActionStatusSaveSuccess implements Action {
    readonly type = StatusActionTypes.SAVE_SUCCESS;
    constructor(readonly payload: any) { }
}
export class ActionStatusSaveError implements Action {
    readonly type = StatusActionTypes.SAVE_ERROR;
    constructor(readonly payload: any) { }
}

export type StatusActions = ActionStatusSave 
| ActionStatusSaveSuccess 
| ActionStatusSaveError;
