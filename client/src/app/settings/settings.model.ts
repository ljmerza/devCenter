import { AppState } from '@app/core';

export interface SettingsState {
  username: string,
  password: string,
  port: string,
  devServer: string,
  emberUrl: string,
  teamUrl: string,
  tempUrl: string,
  cache: boolean,
  theme: string,
  encryptPassword?: boolean,
  isThemeChange?: boolean
}

export interface State extends AppState {
  settings: SettingsState
}