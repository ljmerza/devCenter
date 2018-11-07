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
  theme: 'DEFAULT-THEME'
};

export function settingsReducer(state: SettingsState = initialState, action: SettingsActions): SettingsState {
  switch (action.type) {
    case SettingsActionTypes.CHANGE_THEME:
    case SettingsActionTypes.PERSIST:
      return { ...state, ...action.payload };

    default:
      return state;
  }
}
