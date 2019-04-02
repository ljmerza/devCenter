

export interface StatusTicket {
    component: string,
    status: String,
    fullStatus: Status,
    key: string,
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

export interface Status {
    status: Transition,
    components: Transition[]
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


export interface StatusState {
    loading: boolean,
    tickets: Array<StatusTicket>,
    error: string,
    allStatuses: any[]
};