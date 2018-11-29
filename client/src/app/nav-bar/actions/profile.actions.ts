import { Action } from '@ngrx/store';

export enum NavBarProfileActionTypes {
    PROFILE = '[nav-bar] Profile',
    PROFILE_SUCCESS = '[nav-bar] Profile Success',
    PROFILE_ERROR = '[nav-bar] Profile Error'
}

export class ActionProfile implements Action {
    readonly type = NavBarProfileActionTypes.PROFILE;
}

export class ActionProfileSuccess implements Action {
    readonly type = NavBarProfileActionTypes.PROFILE_SUCCESS;
    constructor(readonly payload: any) { }
}
export class ActionProfileError implements Action {
    readonly type = NavBarProfileActionTypes.PROFILE_ERROR;
    constructor(readonly payload: string) { }
}

export type NavBarProfileActions = ActionProfile | ActionProfileSuccess | ActionProfileError;
