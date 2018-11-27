import { Action } from '@ngrx/store';

export enum branchInfoActionTypes {
  PING = '[jira-branch-info] Ping',
  PING_SUCCESS = '[jira-branch-info] Ping Success',
  PING_ERROR = '[jira-branch-info] Ping Error',
}

export class ActionBranchInfoPing implements Action {
    readonly type = branchInfoActionTypes.PING;
    constructor(readonly payload: any) {}
}

export class ActionBranchInfoPingSuccess implements Action {
    readonly type = branchInfoActionTypes.PING_SUCCESS;
    constructor(readonly payload: any) { }
}

export class ActionBranchInfoPingError implements Action {
    readonly type = branchInfoActionTypes.PING_ERROR;
}

export type branchInfoActions = ActionBranchInfoPing | ActionBranchInfoPingSuccess | ActionBranchInfoPingError;
