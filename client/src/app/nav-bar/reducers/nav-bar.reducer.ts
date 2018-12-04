import { 
	NavBarActions, NavBarProfileActions, NavBarLinksActions, NavBarStatusActions,
	NavBarActionTypes, NavBarProfileActionTypes, NavBarLinksActionTypes, NavBarStatusActionTypes
} from '../actions';
import { NavBarState } from '../nav-bar.model';

import { processNavBarItems } from './navbar-items.tool';
import { processJqlLinks } from './jql.tool';

export const initialState: NavBarState = {
	loading: false,
	navBarItems: {},
	navBarError: '',

	loadingProfile: false,
	profile: null,
	profileError: '',

	loadingLinks: false,
	links: [],
	linksError: '',

	loadingStatuses:false,
	statuses:[],
	statusesError: ''
};

type Action = NavBarActions | NavBarProfileActions | NavBarLinksActions | NavBarStatusActions;


export function navBarReducer(state: NavBarState = initialState, action: Action): NavBarState {
	switch (action.type) {

		case NavBarActionTypes.RETRIEVE:
			return { ...state, loading: true };
		case NavBarActionTypes.RETRIEVE_SUCCESS:
			return { ...state, loading: false, navBarItems: processNavBarItems(action.payload)};
		case NavBarActionTypes.RETRIEVE_ERROR:
			return { ...state, loading: false, navBarError: action.payload };

		case NavBarProfileActionTypes.PROFILE:
			return { ...state, loadingProfile: true };
		case NavBarProfileActionTypes.PROFILE_SUCCESS:
			return { ...state, loadingProfile: false, profile: action.payload };
		case NavBarProfileActionTypes.PROFILE_ERROR:
			return { ...state, loadingProfile: false, profileError: action.payload };

		case NavBarLinksActionTypes.LINKS:
			return { ...state, loadingLinks: true };
		case NavBarLinksActionTypes.LINKS_SUCCESS:
			const jqls = action.payload.map(jql => ({...jql}));
			return { ...state, loadingLinks: false, links: processJqlLinks(jqls) };
		case NavBarLinksActionTypes.LINKS_ERROR:
			return { ...state, loadingLinks: false, linksError: action.payload };

		case NavBarStatusActionTypes.STATUS:
			return { ...state, loadingStatuses: true };
		case NavBarStatusActionTypes.STATUS_SUCCESS:
			return { ...state, loadingStatuses: false, statuses: processStatuses(action.payload) };
		case NavBarStatusActionTypes.STATUS_ERROR:
			return { ...state, loadingStatuses: false, statusesError: action.payload };

		default:
			return state;
	}
}

/**
 * for each status map valid tranisiotn objects
 * @param statuses 
 */
function processStatuses(statuses){
	
	return statuses.map(status => {
		if (!status.transitions) return status;
		status = { ...status}
		
		status.transitions = status.transitions.split(',').map(transition => {
			return statuses.find(status => status.id === transition);
		});

		return status;
	});
}
