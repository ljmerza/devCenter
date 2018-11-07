import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { tap, map, catchError, exhaustMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { LocalStorageService } from '@app/core';

import {
  ActionSettingsPersist, ActionSettingsEncryptPassword,
  SettingsActionTypes, ActionSettingsRetrieveError
} from './settings.actions';

import { SettingsService } from './settings.service';
import { SettingsState } from './settings.model';

export const SETTINGS_KEY = 'SETTINGS';

@Injectable()
export class SettingsEffects {
  constructor(private actions$: Actions<Action>, private ls: LocalStorageService, private service: SettingsService) {}

  @Effect()
  encryptPassword = this.actions$.pipe(
    ofType<ActionSettingsEncryptPassword>(SettingsActionTypes.ENCRYPT),
    exhaustMap(action =>
      this.service.encryptPassword(action.payload.password).pipe(
        map((response: any) => new ActionSettingsPersist({...action.payload, password: response.data})),
        catchError(error => of(new ActionSettingsRetrieveError({ error })))
      )
    )
  );

  @Effect({ dispatch: false })
  persistSettings = this.actions$.pipe(
    ofType<ActionSettingsPersist>(SettingsActionTypes.PERSIST),
    tap(action => this.ls.setItem(SETTINGS_KEY, action.payload))
  );
}
