export interface CommentTicket {
	msrp: string;
	key: string;
	comments: Array<Comment>;
	attachments?: Array<Attachment>;
	dates: TicketDate;
	ticketType?: string;
}

export interface Attachment {
	filename: string;
	link: string;
}

export interface TicketDate {
	estimate: string;
	estimate_seconds: number;
	logged: string;
	logged_seconds: number;
	created: string;
	updated: string;
	started: string;
	duedate: string;
}

export interface Comment {
	comment: string;
	raw_comment: string;
	id: string;
	key: string;
	username: string;
	email: string;
	display_name: string;
	comment_type: string;
	created: string;
	updated: string;
	isEditing: boolean;
	closeText: string;
	editId: string;
	isVisible: boolean;
	visibilityName: string;
}

export interface CommentState {
	loading: boolean;
	tickets: Array<CommentTicket>;
	error: string;
}
