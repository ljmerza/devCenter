import { UserDetails } from './UserDetails';
import { Dates } from './Dates';
import { Comment } from './Comment';
import { Attachment } from './Attachment';
import { Watcher } from './Watcher';
import { CodeReviewer } from './CodeReviewer';
import { Link } from './Link';

export interface Ticket {
	key: String,
	msrp: String,
	user_details: UserDetails,
	username: String,
	customer_details: UserDetails,
	dates: Dates,
	crucible_id?: String,
	summary: String,
	component: String,
	status: String,
	story_point: Number,
	sprint: String,
	epic_link: String,
	label: String,
	comments: Comment[],
	attachments: Attachment[],
	watchers: Watcher[],
	priority: String,
	severity: String,
	code_reviewer: CodeReviewer,
	issue_type: String,
	environment: String,
	links: Link,
	commit: String,
	branch: String
}