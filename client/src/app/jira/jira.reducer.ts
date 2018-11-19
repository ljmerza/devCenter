import { JiraActions, JiraActionTypes } from './jira.actions';
import { JiraState } from './jira.model';

export const initialState: JiraState = {
    loading: false,
    tickets: [],
    current_jql: '',
    totalTickets: 0,
};

export function JiraReducer(state: JiraState = initialState, action: JiraActions): JiraState {
    console.log(action)
    
    switch (action.type) {
        case JiraActionTypes.RETRIEVE:
            return { ...state, loading: true, ...action.payload };
        case JiraActionTypes.RETRIEVE_SUCCESS:
            return { ...state, loading: false, tickets: action.payload.data, totalTickets: action.payload.total_tickets };
        case JiraActionTypes.RETRIEVE_ERROR:
            return { ...state, loading: false };

        default:
            return state;
    }
}
