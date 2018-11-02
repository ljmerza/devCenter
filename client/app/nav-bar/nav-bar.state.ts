import { HttpErrorResponse } from '@angular/common/http';
import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import { AppState } from '@app/core';

import { NavBarItem } from './nav-bar.model';

export interface NavBarState {
  loading: boolean;
  navBarItems?: NavBarItem[];
  error?: HttpErrorResponse | null;
}

export const FEATURE_NAME = 'navBar';
