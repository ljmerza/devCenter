import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
    branchInfoActionTypes, branchInfoActions,
    ActionBranchInfoPing, ActionBranchInfoPingSuccess, ActionBranchInfoPingError, 
} from '../actions';

import { BranchInfoService } from '../services';
import { NotificationService } from '@app/core/notifications/notification.service';

@Injectable()
export class BranchInfoEffects {
    constructor(private actions$: Actions<Action>, private service: BranchInfoService, private notifications: NotificationService) {}

    @Effect()
    sendPing = () =>
        this.actions$.pipe(
            ofType<branchInfoActions>(branchInfoActionTypes.PING),
            switchMap((action: ActionBranchInfoPing) => 
                this.service.sendPing(action.payload).pipe(
                    map((response: any) => new ActionBranchInfoPingSuccess(response.data)),
                    catchError(error => {
                        this.notifications.error(error);
                        return of(new ActionBranchInfoPingError())
                    })
                )
            )
        );

    
}