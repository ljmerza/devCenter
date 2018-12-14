import { Action } from '@ngrx/store';

export enum ProfileActionTypes {
    RETRIEVE = '[profile] Profile',
    RETRIEVE_SUCCESS = '[profile] Profile Success',
    RETRIEVE_ERROR = '[nprofile] Profile Error'
}

export class ActionProfile implements Action {
    readonly type = ProfileActionTypes.RETRIEVE;
}

export class ActionProfileSuccess implements Action {
    readonly type = ProfileActionTypes.RETRIEVE_SUCCESS;
    constructor(readonly payload: any) { }
}
export class ActionProfileError implements Action {
    readonly type = ProfileActionTypes.RETRIEVE_ERROR;
    constructor(readonly payload: string) { }
}

export type ProfileActions = ActionProfile | ActionProfileSuccess | ActionProfileError;
