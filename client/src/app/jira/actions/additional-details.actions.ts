import { Action } from '@ngrx/store';

export enum additionalDetailsActionTypes {
  RETRIEVE = '[jira-additional-details] Retrieve',
  RETRIEVE_SUCCESS = '[jira-additional-details] Retrieve Success',
  RETRIEVE_ERROR = '[jira-additional-details] Retrieve Error',
}

export class ActionAdditionalDetailsRetrieve implements Action {
    readonly type = additionalDetailsActionTypes.RETRIEVE;
    constructor(readonly payload: string) {}
}

export class ActionAdditionalDetailsSuccess implements Action {
    readonly type = additionalDetailsActionTypes.RETRIEVE_SUCCESS;
    constructor(readonly payload: any) { }
}

export class ActionAdditionalDetailsError implements Action {
    readonly type = additionalDetailsActionTypes.RETRIEVE_ERROR;
}

export type additionalDetailsActions = ActionAdditionalDetailsRetrieve | ActionAdditionalDetailsSuccess | ActionAdditionalDetailsError;
