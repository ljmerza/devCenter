export interface Comment {
	comment: String,
	raw_comment: String,
	id: Number,
	key: String,
	username: String,
	email: String,
	display_name: String,
	comment_type: String,
	created: Date,
	updated: Date,
	visibility: String,
	isEditing?: Boolean,
	closeText?: String,
	editId?: String
}