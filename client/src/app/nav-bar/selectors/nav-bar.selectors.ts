import { createSelector } from '@ngrx/store';
import { NavBarState } from '../nav-bar.model';
import { selectSettingsState } from './base.selectors';

export const selectNavBarItems = createSelector(selectSettingsState, (state: NavBarState) => state.navBarItems);
export const selectProfile = createSelector(selectSettingsState, (state: NavBarState) => state.profile);
export const selectLinks = createSelector(selectSettingsState, (state: NavBarState) => state.links);