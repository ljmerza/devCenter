import { ReposActionTypes, ReposActions} from './repos.actions';
import { ReposState } from './repos.models';

export const initialReposState: ReposState = {
    loading: false,
    repos: [],
    error: '',
};

export function ReposReducer(state: ReposState = initialReposState, action: ReposActions): ReposState {
    switch (action.type) {
        case ReposActionTypes.RETRIEVE:
            return { ...state, loading: true};

        case ReposActionTypes.RETRIEVE_SUCCESS:
            return { ...state, loading: false, repos: action.payload};

        case ReposActionTypes.RETRIEVE_ERROR:
            return { ...state, loading: false};

        default:
            return state;
    }
}
