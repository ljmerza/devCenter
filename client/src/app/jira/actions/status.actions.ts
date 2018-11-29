import { Action } from '@ngrx/store';

export enum StatusActionTypes {
    SAVE = '[jira-status] Save',
    SAVE_SUCCESS = '[jira-status] Save Success',
    SAVE_ERROR = '[jira-status] Save Error',

    SAVE_QA = '[jira-status-qa] Save',
    SAVE_QA_SUCCESS = '[jira-status-qa] Save Success',
    SAVE_QA_ERROR = '[jira-status-qa] Save Error',
}

export class ActionStatusSave implements Action {
    readonly type = StatusActionTypes.SAVE;
    constructor(readonly payload: any) { }
}
export class ActionStatusSaveSucess implements Action {
    readonly type = StatusActionTypes.SAVE_SUCCESS;
    constructor(readonly payload: any) { }
}
export class ActionStatusSaveError implements Action {
    readonly type = StatusActionTypes.SAVE_ERROR;
    constructor(readonly payload: any) { }
}

export class ActionStatusQaSave implements Action {
    readonly type = StatusActionTypes.SAVE_QA;
    constructor(readonly payload: any) { }
}
export class ActionStatusQaSaveSucess implements Action {
    readonly type = StatusActionTypes.SAVE_QA_SUCCESS;
    constructor(readonly payload: any) { }
}
export class ActionStatusQaSaveError implements Action {
    readonly type = StatusActionTypes.SAVE_QA_ERROR;
    constructor(readonly payload: any) { }
}


export type StatusActions = ActionStatusSave 
| ActionStatusSaveSucess 
| ActionStatusSaveError

| ActionStatusQaSave
| ActionStatusQaSaveSucess
| ActionStatusQaSaveError;
