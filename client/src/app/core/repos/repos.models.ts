export interface Repo {
    id?: string,
    name: string,
}

export interface ReposState {
    loading: boolean;
    repos: Repo[],
    error: string,
}
