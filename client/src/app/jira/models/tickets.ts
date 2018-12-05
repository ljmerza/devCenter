export interface JiraTicket {
    key?: string,
    msrp?: string,
    links?: Array<any>,
    comments?: Array<any>,
    attachments?: Array<any>,
    dates?: any,

    component: string,
    status: string,

    master_branch: string,
    sprint: string,
    branch: string,
    commit: string,
    epicLink: string,

    dev_changes: string,
    pcrCountLeft: string,
    pullRequests: Array<any>,
};

export interface TicketsState {
    loading: boolean;
    tickets: JiraTicket[],

    additionalLoading: boolean,
    additionalTickets: JiraTicket[],

    commentsLoading: boolean,
    commentsTickets: Array<any>,
    commentsError: string,

    datesTickets: Array<any>,

    currentJql: string,
    ticketType: string,
    fields: string
}