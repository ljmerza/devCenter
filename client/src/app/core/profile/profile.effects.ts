import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ActionProfile, ActionProfileSuccess, ActionProfileError, ProfileActionTypes } from './profile.actions';
import { ProfileService } from './profile.service';
import { NotificationService } from '@app/core/notifications/notification.service';

@Injectable()
export class ProfileEffects {
    constructor(private actions$: Actions<Action>, private service: ProfileService, private notifications: NotificationService) { }

    @Effect()
    getProfile = () =>
        this.actions$.pipe(
            ofType<ActionProfile>(ProfileActionTypes.RETRIEVE),
            switchMap(() => {
                return this.service.getProfile().pipe(
                    map((response: any) => new ActionProfileSuccess(response.data)),
                    catchError(error => {
                        this.notifications.error(error);
                        return of(new ActionProfileError(error))
                    })
                )
            })
        ); 
}
