export interface JiraTicket {
	key:string,
	summary:string,
	status:string,
	component:string,
	dates:JiraDates,
	crucible_id: string,
	username:string
}

export interface JiraDates {
	started:number,
	duedate:number,
	estimate:number,
	logged:number
}


