export interface Repo {
    name: string;
}

export interface ReposState {
    loading: boolean;
    repos: Repo[],
    error: string,
}
