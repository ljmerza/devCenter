import { NavBarActions, NavBarActionTypes } from './nav-bar.actions';
import { NavBarState } from './nav-bar.state';



export const initialState:NavBarState = {
  loading: false,
  navBarItems: [],
  error: null,
};

export function navBarReducer(state:NavBarState=initialState, action:NavBarActions):NavBarState {

  switch (action.type) {
    case NavBarActionTypes.RETRIEVE:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case NavBarActionTypes.RETRIEVE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        ...action.payload
      };

    case NavBarActionTypes.RETRIEVE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    default:
      return state;
  }
}
