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
  isThemeChange: false
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
