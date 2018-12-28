
export interface DropdownItem {
    name?: string,
    display_name?: string,
    query?: string,
    hasFullUrl?: boolean,
    isEmber?: boolean,
    isTeam?: boolean,
    link?: string,
    items?: DropdownItem[],
}