import { NavBarActions, NavBarActionTypes } from './nav-bar.actions';
import { NavBarState } from './nav-bar.model';

export const initialState: NavBarState = {
  loading: false,
  navBarItems: [],
  loadingProfile: false,
  profile: null
};

export function navBarReducer(state: NavBarState=initialState, action: NavBarActions): NavBarState {
  switch (action.type) {

    case NavBarActionTypes.RETRIEVE:
      return { ...state, loading: true };
    case NavBarActionTypes.RETRIEVE_SUCCESS:
      return { ...state, loading: false, ...action.payload };
    case NavBarActionTypes.RETRIEVE_ERROR:
      return { ...state, loading: false };

    case NavBarActionTypes.PROFILE:
      return { ...state, loadingProfile: true };
    case NavBarActionTypes.PROFILE_SUCCESS:
      return { ...state, loadingProfile: false, ...action.payload };
    case NavBarActionTypes.PROFILE_ERROR:
      return { ...state, loadingProfile: false };

    default:
      return state;
  }
}
