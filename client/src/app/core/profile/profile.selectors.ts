import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProfileState } from './profile.models';

export const selectProfileState = createFeatureSelector<ProfileState>('profile');
export const selectProfile = createSelector(selectProfileState, (state: ProfileState) => state.profile);
