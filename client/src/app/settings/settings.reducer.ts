import { SettingsState } from './settings.model';
import { SettingsActions, SettingsActionTypes } from './settings.actions';

export const initialState: SettingsState = {
  username: '',
  password: '',
  port: '',
  devServer: '',
  emberUrl: '',
  tempUrl: '',
  teamUrl: '',
  cache: false,
  theme: 'DEFAULT-THEME',
  isThemeChange: false,
  ticketColumnDefinitions: [
    {name: 'Key', display: true},
    {name: 'MSRP', display: true},
    {name: 'Actions', display: true},
    {name: 'Summary', display: true},
    {name: 'Status', display: true},
    {name: 'Start Date', display: true},
    {name: 'Due Date', display: true},
    {name: 'Estimate', display: true},
    {name: 'Logged', display: true},
    {name: 'Last Update', display: false},
    {name: 'Created', display: false},
    {name: 'Sprint', display: false},
    {name: 'Pull Requests', display: true},
    {name: 'Assignee', display: true},
    {name: 'Customer', display: true},
  ]
};

export function settingsReducer(state: SettingsState = initialState, action: SettingsActions): SettingsState {
  switch (action.type) {
    case SettingsActionTypes.CHANGE_THEME:
    return { ...state, ...action.payload, isThemeChange: true};

    case SettingsActionTypes.PERSIST:
      return { ...state, ...action.payload, isThemeChange: false};

    default:
      return state;
  }
}
