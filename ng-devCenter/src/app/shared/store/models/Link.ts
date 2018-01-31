export interface Link {
	id: String,
	self: String,
	type: LinkType,
	inwardIssue?: Issue,
	outwardIssue?: Issue,
}

interface LinkType {
	id: String,
	inward: String,
	name: String,
	outward: String,
	self: String
}

interface Issue {
	fields: Fields
	id: String, 
	key: String,
	self: String,
}

interface Fields {
	issueType: IssueType
	priority: Priority,
	status: Status,
	summary: String,
}						

interface Status {
	self: String,
	description: String,
	iconUrl: String,
	name: String,
	id: String,
	statusCategory: StatusCategory
}

interface StatusCategory {
	self: String,
	id: String,
	key: String,
	colorName: String,
	name: String
}

interface Priority {
	self: String,
	iconUrl: String,
	name: String,
	id: String
}

interface IssueType {
	description: String,
	iconUrl: String,
	id: String,
	name: String,
	self: String,
	subtask: Boolean
}