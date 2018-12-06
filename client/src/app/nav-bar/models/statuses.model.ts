
export interface StatusesModel {
    id?: string,
    team_id?: string,
    status_name: string,
    status_code: string,
    transitions?: StatusesModel[],
    auto_transition?: string
    constant?: string,
    color?:string,
}