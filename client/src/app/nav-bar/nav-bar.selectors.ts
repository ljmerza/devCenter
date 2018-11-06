import { createSelector } from '@ngrx/store';
import { NavBarState } from './nav-bar.state';

export const selectNavBar = state => state.navBar;
export const selectNavBarItems = createSelector(
  selectNavBar,
  (state: NavBarState) => state.navBarItems
);
export const selectNavBarLoading = createSelector(
  selectNavBar,
  (state: NavBarState) => state.loading
);
export const selectNavBarError = createSelector(
  selectNavBar,
  (state: NavBarState) => state.error
);
