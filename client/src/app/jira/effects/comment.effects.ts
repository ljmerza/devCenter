import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
    ActionCommentSave, ActionCommentSaveSucess, ActionCommentSaveError,
    ActionCommentEdit, ActionCommentEditSuccess, ActionCommentEditError,
    ActionCommentDelete, ActionCommentDeleteSuccess, ActionCommentDeleteError,
    CommentActions, CommentActionTypes
} from '../actions';

import { CommentsService } from '../services';

@Injectable()
export class CommentEffects {
    constructor(private actions$: Actions<Action>, private service: CommentsService) {}

    @Effect()
    addComment = () =>
        this.actions$.pipe(
            ofType<CommentActions>(CommentActionTypes.SAVE),
            switchMap((action: ActionCommentSave) => 
                this.service.addComment(action.payload).pipe(
                    map((response: any) => {
                        response.data.key = action.payload.key; //save key for finding matching ticket
                        return new ActionCommentSaveSucess(response.data)
                    }),
                    catchError(response => of(new ActionCommentSaveError(response.data)))
                )
            )
        );

    @Effect()
    editComment = () =>
        this.actions$.pipe(
            ofType<CommentActions>(CommentActionTypes.EDIT),
            switchMap((action: ActionCommentEdit) => 
                this.service.editComment(action.payload).pipe(
                    map((response: any) => new ActionCommentEditSuccess(response.data)),
                    catchError(() => of(new ActionCommentEditError()))
                )
            )
        );

    @Effect()
    deleteComment = () =>
        this.actions$.pipe(
            ofType<CommentActions>(CommentActionTypes.DELETE),
            switchMap((action: ActionCommentDelete) => 
                this.service.deleteComment(action.payload).pipe(
                    map((response: any) => new ActionCommentDeleteSuccess(response.data)),
                    catchError(() => of(new ActionCommentDeleteError()))
                )
            )
        );
}