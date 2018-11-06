import { HttpErrorResponse } from '@angular/common/http';
import { Action } from '@ngrx/store';
import { SettingsState } from './settings.model';

export enum SettingsActionTypes {
  CHANGE_THEME = '[Settings] Change THEME',
  PERSIST = '[Settings] PERSIST',
  ENCRYPT = '[Settings] ENCRYPT',
  RETRIEVE_ERROR = '[Settings] RETRIEVE_ERROR'
}

export class ActionSettingsChangeTheme implements Action {
  readonly type = SettingsActionTypes.CHANGE_THEME;
  constructor(readonly payload: { theme: string }) {}
}

export class ActionSettingsPersist implements Action {
  readonly type = SettingsActionTypes.PERSIST;
  constructor(readonly payload: SettingsState) {}
}

export class ActionSettingsEncryptPassword implements Action {
  readonly type = SettingsActionTypes.ENCRYPT;
  constructor(readonly payload: SettingsState) {}
}

export class ActionSettingsRetrieveError implements Action {
  readonly type = SettingsActionTypes.RETRIEVE_ERROR;
  constructor(readonly payload: { error: HttpErrorResponse }) {}
}

export type SettingsActions = ActionSettingsChangeTheme | ActionSettingsPersist;
