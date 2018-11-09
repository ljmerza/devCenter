import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SettingsState, State } from './settings.model';

export const selectSettingsState = createFeatureSelector<State, SettingsState>('settings');
export const selectSettings = createSelector(selectSettingsState, (state: SettingsState) => state);

export const selectSettingsUsername = createSelector(selectSettings, state => state.username);
export const selectSettingsPassword = createSelector(selectSettings, state => state.password);


export const getMessage = createSelector(selectSettingsUsername, selectSettingsPassword,
    (username, password) => ({username, password}));