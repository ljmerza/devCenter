import { Action } from '@ngrx/store';

export enum ReposActionTypes {
    RETRIEVE = '[core-repos] Retrieve',
    RETRIEVE_SUCCESS = '[core-repos] Retrieve Success',
    RETRIEVE_ERROR = '[core-repos] Retrieve Error',
}

export class ActionReposRetrieve implements Action {
    readonly type = ReposActionTypes.RETRIEVE;
}

export class ActionReposSuccess implements Action {
    readonly type = ReposActionTypes.RETRIEVE_SUCCESS;
    constructor(readonly payload: any) { }
}

export class ActionReposError implements Action {
    readonly type = ReposActionTypes.RETRIEVE_ERROR;
    constructor(readonly error: string) { }
}

export type ReposActions = ActionReposRetrieve | ActionReposSuccess | ActionReposError;
