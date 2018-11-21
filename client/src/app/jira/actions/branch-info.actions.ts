import { Action } from '@ngrx/store';

export enum branchInfoActionTypes {
  RETRIEVE = '[jira-branch-info] Retrieve',
  RETRIEVE_SUCCESS = '[jira-branch-info] Retrieve Success',
  RETRIEVE_ERROR = '[jira-branch-info] Retrieve Error',
}

export class ActionBranchInfoRetrieve implements Action {
    readonly type = branchInfoActionTypes.RETRIEVE;
    constructor(readonly payload: string) {}
}
export class ActionBranchInfoSuccess implements Action {
    readonly type = branchInfoActionTypes.RETRIEVE_SUCCESS;
    constructor(readonly payload: any) { }
}
export class ActionBranchInfoError implements Action {
    readonly type = branchInfoActionTypes.RETRIEVE_ERROR;
}

export type branchInfoActions = ActionBranchInfoRetrieve | ActionBranchInfoSuccess | ActionBranchInfoError;
