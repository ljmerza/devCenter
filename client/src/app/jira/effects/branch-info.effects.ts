import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
    branchInfoActionTypes, branchInfoActions,
    ActionBranchInfoRetrieve, ActionBranchInfoSuccess, ActionBranchInfoError, 
} from '../actions';

import { BranchInfoService } from '../services';

@Injectable()
export class BranchInfoEffects {
    constructor(private actions$: Actions<Action>, private service: BranchInfoService) {}

    @Effect()
    getAdditionalDetails = () =>
        this.actions$.pipe(
            ofType<branchInfoActions>(branchInfoActionTypes.RETRIEVE),
            switchMap((action: ActionBranchInfoRetrieve) => 
                this.service.getAdditionalDetails(action.payload).pipe(
                    map((response: any) => new ActionBranchInfoSuccess(response.data)),
                    catchError(() => of(new ActionBranchInfoError()))
                )
            )
        );
}