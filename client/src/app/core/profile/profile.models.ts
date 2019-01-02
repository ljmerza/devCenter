export interface Profile {
	key: string;
	name: string;
}

export interface ProfileState {
	loading: boolean;
	profile: Profile;
	error: string;
}
