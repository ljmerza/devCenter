import { AppState } from '@app/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface NavBarItem {}

export interface NavBarState {
  loading: boolean;
  navBarItems?: NavBarItem[];
  error?: HttpErrorResponse | null,
}

export interface State extends AppState {
  navbar: NavBarState
}