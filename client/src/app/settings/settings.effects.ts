import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { tap, map, catchError, exhaustMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { LocalStorageService } from '@app/core';
import { NotificationService } from '@app/core/notifications/notification.service';

import {
  ActionSettingsPersist, ActionSettingsEncryptPassword,
  SettingsActionTypes
} from './settings.actions';

import { SettingsService } from './settings.service';
import { initialState } from './settings.reducer';

export const SETTINGS_KEY = 'SETTINGS';

@Injectable()
export class SettingsEffects {
  constructor(private actions$: Actions<Action>, private ls: LocalStorageService, private service: SettingsService, private notificationsService: NotificationService) {}

  @Effect()
  encryptPassword = this.actions$.pipe(
    ofType<ActionSettingsEncryptPassword>(SettingsActionTypes.ENCRYPT),
    exhaustMap(action => {
      this.notificationsService.info('Encrypting password');

      return this.service.encryptPassword(action.payload.password).pipe(
        map((response: any) =>  new ActionSettingsPersist({...action.payload, password: response.data})),
      );
    })
  );

  @Effect({ dispatch: false })
  persistSettings = this.actions$.pipe(
    ofType<ActionSettingsPersist>(SettingsActionTypes.PERSIST),
    tap(action => {
      this.notificationsService.success('Saved Settings');
      const currentSettings = this.ls.getItem(SETTINGS_KEY) || {};
      this.ls.setItem(SETTINGS_KEY, {...initialState, ...currentSettings, ...action.payload});
    })
  );
}
