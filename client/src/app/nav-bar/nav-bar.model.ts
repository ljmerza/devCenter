import { AppState } from '@app/core';

export interface NavBarItem {}

export interface NavBarState {
  loading: boolean;
  navBarItems?: NavBarItem[],
  loadingProfile: boolean,
  profile: any
}

export interface State extends AppState {
  navbar: NavBarState
}