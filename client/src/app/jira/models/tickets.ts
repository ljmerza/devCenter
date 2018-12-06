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
    description: string,
    story_point: string,
};

export interface TicketsState {
    loading: boolean;
    tickets: JiraTicket[],
    error: string,

    additionalLoading: boolean,
    additionalTickets: JiraTicket[],
    additionalError: string,

    currentJql: string,
    ticketType: string,
    fields: string
}