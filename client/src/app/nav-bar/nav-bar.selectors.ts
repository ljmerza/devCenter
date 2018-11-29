import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NavBarState, State } from './nav-bar.model';

export const selectSettingsState = createFeatureSelector<State, NavBarState>('navbar');

export const selectNavBarItems = createSelector(selectSettingsState, (state: NavBarState) => state.navBarItems);
export const selectProfile = createSelector(selectSettingsState, (state: NavBarState) => state.profile);
export const selectLinks = createSelector(selectSettingsState, (state: NavBarState) => state.links);
export const selectStatuses = createSelector(selectSettingsState, (state: NavBarState) => state.statuses);
