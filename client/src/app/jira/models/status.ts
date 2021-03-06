

export interface StatusTicket {
    component: string,
    status: string,
    fullStatus: Status,
    key: string,
    username: string,
    msrp: string,
    pcrCountLeft: string,
    pullRequests: PullRequest[],
    repoName: string,
    sprint: string,
    branch: string,
    commit: string,
    epicLink: string,
    ticketType?: string,
    storyPoint: string,
    summary: string,
    transitions: Transition[],
}

export interface Transition {
    name: string,
    id: string
}

export interface PullRequest {
    repo: string,
    link: string,
    requestId: string,
}

export interface Status {
    id: string,
    namer: string
}


export interface StatusState {
    loading: boolean,
    tickets: Array<StatusTicket>,
    error: string,
    allStatuses: any[]
};