import { createFeatureSelector } from '@ngrx/store';
import { NavBarState, State } from '../nav-bar.model';

export const selectSettingsState = createFeatureSelector<State, NavBarState>('navbar');
