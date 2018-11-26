import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
    commentSave, commentSaveSucess, commentSaveError,
    commentEdit, commentEditSuccess, commentEditError,
    commentDelete, commentDeleteSuccess, commentDeleteError,
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
            switchMap((action: commentSave) => 
                this.service.addComment(action.payload).pipe(
                    map((response: any) => new commentSaveSucess(response.data)),
                    catchError(() => of(new commentSaveError()))
                )
            )
        );

    editComment = () =>
        this.actions$.pipe(
            ofType<CommentActions>(CommentActionTypes.EDIT),
            switchMap((action: commentEdit) => 
                this.service.editComment(action.payload).pipe(
                    map((response: any) => new commentEditSuccess(response.data)),
                    catchError(() => of(new commentEditError()))
                )
            )
        );

    deleteComment = () =>
        this.actions$.pipe(
            ofType<CommentActions>(CommentActionTypes.DELETE),
            switchMap((action: commentDelete) => 
                this.service.deleteComment(action.payload).pipe(
                    map((response: any) => new commentDeleteSuccess(response.data)),
                    catchError(() => of(new commentDeleteError()))
                )
            )
        );
}