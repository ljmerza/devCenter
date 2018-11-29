import { Action } from '@ngrx/store';

export enum NavBarLinksActionTypes {
    LINKS = '[nav-bar] Links',
    LINKS_SUCCESS = '[nav-bar] Links Success',
    LINKS_ERROR = '[nav-bar] Links Error'
}

export class ActionLinksRetrieve implements Action {
    readonly type = NavBarLinksActionTypes.LINKS;
}
export class ActionLinksSuccess implements Action {
    readonly type = NavBarLinksActionTypes.LINKS_SUCCESS;
    constructor(readonly payload: any) { }
}
export class ActionLinksError implements Action {
    readonly type = NavBarLinksActionTypes.LINKS_ERROR;
    constructor(readonly payload: any) { }
}


export type NavBarLinksActions = ActionLinksRetrieve | ActionLinksSuccess | ActionLinksError;
