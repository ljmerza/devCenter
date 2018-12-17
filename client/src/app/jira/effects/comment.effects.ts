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
import { NotificationService } from '@app/core/notifications/notification.service';

@Injectable()
export class CommentEffects {
    constructor(private actions$: Actions<Action>, private service: CommentsService, private notifications: NotificationService) {}

    @Effect()
    addComment = () =>
        this.actions$.pipe(
            ofType<CommentActions>(CommentActionTypes.SAVE),
            switchMap((action: ActionCommentSave) => {
                this.notifications.info(`Saving comment for ${action.payload.key}`);

                return this.service.addComment(action.payload).pipe(
                    map((response: any) => {
                        response.data.key = action.payload.key; //save key for finding matching ticket
                        if (response.data.comment_response && response.data.comment_response.status) {
                            this.notifications.success(`Successfully saved comment for ${action.payload.key}`);
                            return new ActionCommentSaveSucess(response.data);
                        } else {
                            throw new Error(response);
                        }
                    }),
                    catchError(response => of(new ActionCommentSaveError(response.data)))
                );
            })
        );

    @Effect()
    editComment = () =>
        this.actions$.pipe(
            ofType<CommentActions>(CommentActionTypes.EDIT),
            switchMap((action: ActionCommentEdit) => {
                this.notifications.info(`Saving edited comment ${action.payload.comment_id} for ${action.payload.key}`);
                
                return this.service.editComment(action.payload).pipe(
                    map((response: any) => {
                        if (response.status) {
                            this.notifications.success(`Successfully edited comment ${action.payload.comment_id} for ${action.payload.key}`);
                            return new ActionCommentEditSuccess(response.data);
                        } else {
                            throw new Error(response);
                        }
                    }),
                    catchError(response => of(new ActionCommentEditError(response.data)))
                );
            })
        );

    @Effect()
    deleteComment = () =>
        this.actions$.pipe(
            ofType<CommentActions>(CommentActionTypes.DELETE),
            switchMap((action: ActionCommentDelete) => { 
                this.notifications.info(`Deleting comment ${action.payload.commentId} for ${action.payload.key}`);

                return this.service.deleteComment(action.payload).pipe(
                    map((response: any) => {
                        if (response.status) {
                            this.notifications.success(`Successfully deleted comment ${action.payload.comment_id} for ${action.payload.key}`);
                            return new ActionCommentDeleteSuccess(response.data);
                        } else {
                            throw new Error(response);
                        }
                    }),
                    catchError(response => of(new ActionCommentDeleteError(response.data)))
                );
            })
        );
}