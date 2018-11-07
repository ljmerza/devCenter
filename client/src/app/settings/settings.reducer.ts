import { SettingsState } from './settings.model';
import { SettingsActions, SettingsActionTypes } from './settings.actions';

export const initialState: SettingsState = {
  username: 'lm240n',
  password: '',
  port: '8173',
  devServer: 'rldv0211',
  emberUrl: 'dev',
  tempUrl: 'dev',
  teamUrl: 'dev',
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
