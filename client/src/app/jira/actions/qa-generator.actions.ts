import { Action } from '@ngrx/store';

export enum QaGeneratorActionTypes {
    SAVE_QA = '[jira-status-qa] Save',
    SAVE_QA_SUCCESS = '[jira-status-qa] Save Success',
    SAVE_QA_ERROR = '[jira-status-qa] Save Error',
}


export class ActionStatusQaSave implements Action {
    readonly type = QaGeneratorActionTypes.SAVE_QA;
    constructor(readonly payload: any) { }
}

export class ActionStatusQaSaveSuccess implements Action {
    readonly type = QaGeneratorActionTypes.SAVE_QA_SUCCESS;
    constructor(readonly payload: any) { }
}

export class ActionStatusQaSaveError implements Action {
    readonly type = QaGeneratorActionTypes.SAVE_QA_ERROR;
    constructor(readonly payload: string) { }
}

export type QaGeneratorActions = ActionStatusQaSave | ActionStatusQaSaveSuccess | ActionStatusQaSaveError;