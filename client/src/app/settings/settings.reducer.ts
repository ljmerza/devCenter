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
  ],
  apolloColumnDefinitions: [
    { name: 'UNI CLO', display: true },
    { name: 'UNI Circuit', display: false },
    { name: 'UNI Region', display: false },
    { name: 'UNI OSSOI Order', display: false },
    { name: 'UNI Open Events', display: false },
    { name: 'UNI aseDB', display: false },
    { name: 'UNI OMX/OCX?', display: false },
    { name: 'UNI Edge Forces', display: false },
    { name: 'UNI PO', display: true },
    { name: 'UNI TO', display: true },
    { name: 'UNI ACTS?', display: false },
    { name: 'UNI EAN?', display: false },
    { name: 'UNI Devices', display: false },
    { name: 'UNI PON', display: false },
    { name: 'CNL CLO', display: true },
    { name: 'CNL Circuit', display: false },
    { name: 'CNL Region', display: false },
    { name: 'CNL OSSOI Order', display: false },
    { name: 'CNL Open Events', display: false },
    { name: 'CNL aseDB', display: true },
    { name: 'CNL Edge Forces', display: false },
    { name: 'CNL PO', display: true },
    { name: 'CNL TO', display: true },
    { name: 'CNL Devices', display: false },
    { name: 'CNL PON', display: true },
    { name: 'EVC CLO', display: true },
    { name: 'EVC Circuit', display: false },
    { name: 'EVC Region', display: false },
    { name: 'EVC OSSOI Order', display: false },
    { name: 'EVC Open Events', display: false },
    { name: 'EVC aseDB', display: true },
    { name: 'EVC Edge Forces', display: false },
    { name: 'EVC PO', display: true },
    { name: 'EVC TO', display: true },
    { name: 'EVC PON', display: false },
    { name: 'ATX Site ID', display: true },
    { name: 'ATX PON', display: true },
    { name: 'ATX USO', display: true },
    { name: 'ATX iCore', display: true },
    { name: 'ADE CLO', display: true },
    { name: 'ADE Circuit', display: false },
    { name: 'ADE Region', display: false },
  ],
  atxColumnDefinitions: [

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
