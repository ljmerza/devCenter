

export interface StatusTicket {
    component: string,
    status: string,
    key: string,
    msrp: string,
    pcrCountLeft: string,
    pullRequests: Array<PullRequest>,
    repoName: string,
    sprint: string,
    branch: string,
    commit: string,
    epicLink: string,
    ticketType?: string,
}

export interface PullRequest {
    repo: string,
    link: string,
    requestId: string,
}


export interface StatusState {
    loading: boolean,
    tickets: Array<StatusTicket>,
    error: string
};