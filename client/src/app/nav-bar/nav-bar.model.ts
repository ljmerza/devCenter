import { AppState } from '@app/core';
import { HttpErrorResponse } from '@angular/common/http';

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