import { ReposActionTypes, ReposActions} from './repos.actions';

import { ReposState, Repo } from './repos.models';

export const initialStatusState: ReposState = {
    loading: false,
    repos: [],
    error: '',
};

export function StatusReducer(state: ReposState = initialStatusState, action: ReposActions): ReposState {
    switch (action.type) {
        case ReposActionTypes.RETRIEVE_SUCCESS:
            return { ...state};

        case ReposActionTypes.RETRIEVE_ERROR:
            return { ...state, loading: true };

        default:
            return state;
    }
}
