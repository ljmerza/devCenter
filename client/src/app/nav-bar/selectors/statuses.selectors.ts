import { createSelector } from '@ngrx/store';
import { NavBarState } from '../nav-bar.model';
import { selectSettingsState } from './base.selectors';

export const selectAllStatuses = createSelector(selectSettingsState, (state: NavBarState) => state.statuses);