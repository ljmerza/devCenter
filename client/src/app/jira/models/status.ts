

export interface StatusTicket {
    component: string,
    status: string,
    key: string,
    pcrCountLeft: string,
    pullRequests: Array<PullRequest>,
    repoName: string,
    sprint: string,
    branch: string,
    commit: string,
    epicLink: string,
}

export interface PullRequest {
    repo: string,
    link: string,
    requestId: string,
}


export interface StatusState {
    loading: boolean,
    tickets: Array<StatusTicket>,
    error: string,
};