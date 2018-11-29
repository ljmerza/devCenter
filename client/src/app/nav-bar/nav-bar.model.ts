import { AppState } from '@app/core';

export interface NavBarItem {}

export interface NavBarState {
  loading: boolean;
  navBarItems?: NavBarItem[],
  navBarError: string

  loadingProfile: boolean,
  profile: any,
  profileError: string

  loadingLinks: boolean,
  links: any,
  linksError: string

  loadingStatuses: boolean,
  statuses: any,
  statusesError: string
}

export interface State extends AppState {
  navbar: NavBarState
}