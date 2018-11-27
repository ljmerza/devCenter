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

export class ActionCommentSave implements Action {
    readonly type = CommentActionTypes.SAVE;
    constructor(readonly payload: any) {}
}
export class ActionCommentSaveSucess implements Action {
    readonly type = CommentActionTypes.SAVE_SUCCESS;
    constructor(readonly payload: any) { }
}
export class ActionCommentSaveError implements Action {
    readonly type = CommentActionTypes.SAVE_ERROR;
}


export class ActionCommentEdit implements Action {
    readonly type = CommentActionTypes.EDIT;
    constructor(readonly payload: any) {}
}
export class ActionCommentEditSuccess implements Action {
    readonly type = CommentActionTypes.EDIT_SUCCESS;
    constructor(readonly payload: any) { }
}
export class ActionCommentEditError implements Action {
    readonly type = CommentActionTypes.EDIT_ERROR;
}


export class ActionCommentDelete implements Action {
    readonly type = CommentActionTypes.DELETE;
    constructor(readonly payload: any) {}
}
export class ActionCommentDeleteSuccess implements Action {
    readonly type = CommentActionTypes.DELETE_SUCCESS;
    constructor(readonly payload: any) { }
}
export class ActionCommentDeleteError implements Action {
    readonly type = CommentActionTypes.DELETE_ERROR;
}

export type CommentActions = ActionCommentSave
	| ActionCommentSaveSucess
	| ActionCommentSaveError
	| ActionCommentEdit
	| ActionCommentEditSuccess
	| ActionCommentEditError
	| ActionCommentDelete
	| ActionCommentDeleteSuccess
	| ActionCommentDeleteError;
