import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ReposActionTypes, ActionReposSuccess, ActionReposError, ReposActions } from './repos.actions';
import { ReposService } from './repos.service';
import { NotificationService } from '@app/core/notifications/notification.service';

@Injectable()
export class ReposEffects {
    constructor(private actions$: Actions<Action>, private service: ReposService, private notifications: NotificationService) { }

    @Effect()
    getRepos = () =>
        this.actions$.pipe(
            ofType<ReposActions>(ReposActionTypes.RETRIEVE),
            switchMap(() =>
                this.service.getRepos().pipe(
                    map((response: any) => new ActionReposSuccess(response.data)),
                    catchError(error => {
                        this.notifications.error(error);
                        return of(new ActionReposError(error))
                    })
                )
            )
        );
}