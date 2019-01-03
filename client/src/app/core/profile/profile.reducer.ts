import {ProfileActions, ProfileActionTypes} from './profile.actions';
import {ProfileState} from './profile.models';

export const initialState: ProfileState = {
	loading: false,
	profile: {
		key: '',
		name: '',
	},
	error: '',
};

export function ProfileReducer(state: ProfileState = initialState, action: ProfileActions): ProfileState {
	switch (action.type) {
		case ProfileActionTypes.RETRIEVE:
			return {...state, loading: true};
		case ProfileActionTypes.RETRIEVE_SUCCESS:
			return {...state, loading: false, profile: action.payload};
		case ProfileActionTypes.RETRIEVE_ERROR:
			return {...state, loading: false};

		default:
			return state;
	}
}
