import { Action } from '@ngrx/store';

export enum CommentActionTypes {
    SAVE = '[jira-comment] Save',
    SAVE_SUCCESS = '[jira-comment] Save Success',
    SAVE_ERROR = '[jira-comment] Save Error',

    EDIT = '[jira-comment] Edit',
    EDIT_SUCCESS = '[jira-comment] Edit Success',
    EDIT_ERROR = '[jira-comment] Edit Error',

    DELETE = '[jira-comment] Delete',
    DELETE_SUCCESS = '[jira-comment] Delete Success',
    DELETE_ERROR = '[jira-comment] Delete Error',
}

export class commentSave implements Action {
    readonly type = CommentActionTypes.SAVE;
    constructor(readonly payload: any) {}
}
export class commentSaveSucess implements Action {
    readonly type = CommentActionTypes.SAVE_SUCCESS;
    constructor(readonly payload: any) { }
}
export class commentSaveError implements Action {
    readonly type = CommentActionTypes.SAVE_ERROR;
}


export class commentEdit implements Action {
    readonly type = CommentActionTypes.EDIT;
    constructor(readonly payload: any) {}
}
export class commentEditSuccess implements Action {
    readonly type = CommentActionTypes.EDIT_SUCCESS;
    constructor(readonly payload: any) { }
}
export class commentEditError implements Action {
    readonly type = CommentActionTypes.EDIT_ERROR;
}


export class commentDelete implements Action {
    readonly type = CommentActionTypes.DELETE;
    constructor(readonly payload: any) {}
}
export class commentDeleteSuccess implements Action {
    readonly type = CommentActionTypes.DELETE_SUCCESS;
    constructor(readonly payload: any) { }
}
export class commentDeleteError implements Action {
    readonly type = CommentActionTypes.DELETE_ERROR;
}

export type CommentActions = commentSave
	| commentSaveSucess
	| commentSaveError
	| commentEdit
	| commentEditSuccess
	| commentEditError
	| commentDelete
	| commentDeleteSuccess
	| commentDeleteError;
