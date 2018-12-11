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
  isThemeChange: boolean,
  ticketColumnDefinitions: ColumnDefinition[]
}

export interface ColumnDefinition {
  name: string,
  display: boolean
}

export interface State extends AppState {
  settings: SettingsState
}