import { AppState } from '@app/core';

import { StatusesModel } from './models';
export interface NavBarItem {}

export interface NavBarState {
  loading: boolean;
  navBarItems?: {},
  navBarError: string

  loadingLinks: boolean,
  links: any,
  linksError: string

  loadingStatuses: boolean,
  statuses: StatusesModel[],
  statusesError: string
}

export interface State extends AppState {
  navbar: NavBarState
}