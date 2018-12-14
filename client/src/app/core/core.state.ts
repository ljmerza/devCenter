import { ActionReducerMap, MetaReducer, createFeatureSelector } from '@ngrx/store';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from '@env/environment';

import { initStateFromLocalStorage } from './meta-reducers/init-state-from-local-storage.reducer';
import { debug } from './meta-reducers/debug.reducer';
import { RouterStateUrl } from './router/router.state';

import { ReposReducer, ReposState } from './repos';
import { ProfileReducer, ProfileState } from './profile';

export const reducers: ActionReducerMap<AppState> = {
  router: routerReducer,
  repos: ReposReducer,
  profile: ProfileReducer
};

export const metaReducers: MetaReducer<AppState>[] = [
  initStateFromLocalStorage,
];

if (!environment.production) {
  metaReducers.unshift(storeFreeze);
  
  if (!environment.test) {
    metaReducers.unshift(debug);
  }
}

export const selectRouterState = createFeatureSelector<AppState, RouterReducerState<RouterStateUrl>>('router');

export interface AppState {
  router: RouterReducerState<RouterStateUrl>,
  repos: ReposState,
  profile: ProfileState
}
