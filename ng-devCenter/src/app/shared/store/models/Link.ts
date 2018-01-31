export interface Link {
	id: String,
	self: String,
	type: LinkType,
	inwardIssue?: Issue,
	outwardIssue?: Issue,
}

interface LinkType {
	id: String,
	name: String,
	inward: String,
	outward: String,
	self: String
}

interface Issue {
	id: String, 
	key: String,
	self: String,
	fields: Fields
}

interface Fields {
	summary: String,
	status: Status,
	priority: Priority,
	issueType: IssueType
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
	self: String,
	id: String,
	description: String,
	iconUrl: String,
	name: String,
	subtask: String
}