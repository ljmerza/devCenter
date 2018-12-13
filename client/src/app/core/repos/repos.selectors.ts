import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReposState } from './repos.models';

export const selectReposState = createFeatureSelector<ReposState>('repos');
export const selectRepos = createSelector(selectReposState, (state: ReposState) => state.repos);
