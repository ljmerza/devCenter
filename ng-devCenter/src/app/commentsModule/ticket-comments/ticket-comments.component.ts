import { 
	Component, ViewChild, ElementRef, EventEmitter, AfterViewInit,
	ViewEncapsulation, Input, Output, OnInit, ChangeDetectionStrategy
} from '@angular/core';

import { NgRedux } from '@angular-redux/store';
import { RootState } from './../../shared/store/store';
import { Comment } from './../../shared/store/models/Comment';
import { Actions } from './../../shared/store/actions';
import { Ticket } from './../../shared/store/models/ticket';

import { ModalComponent } from './../../shared/modal/modal.component';
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';
import { UserService } from './../../shared/services/user.service';
import { MiscService } from './../../shared/services/misc.service';

declare var hljs :any;
declare var $ :any;

@Component({
	selector: 'dc-ticket-comments',
	templateUrl: './ticket-comments.component.html',
	styleUrls: ['./ticket-comments.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketCommentsComponent implements OnInit, AfterViewInit {
	commentId;
	modalRef;
	customModalCss = 'ticketComment';
	comments: Array<Comment>;

	@ViewChild(ModalComponent) modal: ModalComponent;
	@Input() key;
	@Input() attachments;
	@Output() commentChangeEvent = new EventEmitter();
	commentsRedux$;

	constructor(
		private toastr: ToastrService, public user:UserService, 
		public jira:JiraService, private misc: MiscService,
		public store:NgRedux<RootState>
	) { }

	/**
	 * redux selector for this ticket's comments. On new comments save to this instance.
	 */
	ngOnInit():void {
		this.syncComments();
	}
	
	/**
	 *
	 *
	 */
	syncComments():void {
		this.commentsRedux$ = this.store.select('tickets')
		.filter( (ticket:Ticket) => ticket.key == this.key)
		.map( (ticket:Ticket) => ticket.comments)
		.subscribe( (comments:Array<Comment>) => {
			console.log('comments: ', comments);
			this.comments = comments;
		});
	}

	/**
	 * filters out comments for this ticket only from the redux store
	 * @param {RootState} state the current redux state when comment event is triggered
	 */
	commentSelector(state):Array<Comment> {
		return state.tickets
		.map(ticket => ticket.comments)
		.filter(comments => comments.length > 0 && comments[0].key === this.key)[0];
	}

	/**
	 * add code highlighting to each comment and add copy text
	 * functionality to each table item
	 */
	ngAfterViewInit():void {
		const misc=this.misc;
		
		setTimeout(() => {
			// highlight code needs to be triggered after modal opens
			$('pre').each(function(i, block) {
				hljs.highlightBlock(block);
			});

			// for each table item add click event for copying text
			$('.tableCopy').each(function(i, block) {
				$(this).click(function(){
					misc.copyText( $(this).children('input').get(0) );
				});
			});
		});
	}

	/**
	 * toggle editing boolean on a comment object and change close text
	 * based on editing or not
	 * @param {Comment} comment the comment to change editing values on
	 */
	toggleEditing(comment){
		comment.isEditing = !comment.isEditing;
		comment.closeText = comment.closeText == 'Cancel Editing' ? 'Edit Comment' : 'Cancel Editing';
	}

	/**
	 * saves commentId and opens verify dialog for deletion of comment
	 * @param {String} commentId the comment ID of the comment to delete
	 */
	deleteComment(commentId) {
		this.commentId = commentId;
		// open delete modal
		this.modalRef = this.modal.openModal();
	}

	/**
	 * If delete confirmation then remove comment from comments
	 * array and send commentId to API to persist delete
	 * @param {Boolean} deleteComment do we delete the comment?
	 */
	closeDeleteModal(deleteComment?){

		this.modalRef.close();
		if(!deleteComment) return;

		// get index of comment and remove it from store and locally
		const pos = this.comments.map(comm =>	comm.id).indexOf(this.commentId);
		const deletedComment = this.comments.splice(pos, 1);
		this.store.dispatch({type: Actions.removeComment, payload:deletedComment[0] });
		this.syncComments();

		this.jira.deleteComment(this.commentId, this.key).subscribe(
			() => {
				this.commentChangeEvent.emit({allComments: this.comments});
				this.toastr.showToast('Comment Deleted Successfully', 'success');
			},
			error => {
				// if error revert comment and show error
				this.comments.splice(pos, 0, ...deletedComment);
				this.toastr.showToast(this.jira.processErrorResponse(error), 'error');
			}
		);
	}

	/**
	 * Edit's a comment's body and persists to backend
	 * @param {Comment} comment the comment object to edit
	 */
	editComment(comment){

		// toggle editing text
		this.toggleEditing(comment);

		const newComment = $(`#${comment.editId}`).val();

		// make sure we have a change
		if(newComment == comment.comment){
			this.toastr.showToast(`No changes to comment ${comment.id} made.`, 'info');
			return;
		}

		const postData = {
			key: this.key,
			comment_id: comment.id,
			comment: newComment
		};

		// save old comment if error and replace new comment with old
		const oldComment = comment.comment;
		comment.comment = postData.comment;

		this.jira.editComment(postData).subscribe(
			response => {
				// get new comment to save new details
				const newComment = response.data;

				// add data from new comment response to local new comment object
				this.comments = this.comments.map(comment => {
					// if ID match save new comment details
					if(comment.id === postData.comment_id){
						comment.updated = newComment.response;
						comment.raw_comment = newComment.body;
						comment.comment = newComment.renderedBody;
					}
					return comment;
				});

				this.commentChangeEvent.emit({allComments: this.comments});
				this.toastr.showToast('Comment Edited Successfully', 'success');
			},
			error => {
				// if error revert comment and show error
				comment.comment = oldComment;
				this.toastr.showToast(this.jira.processErrorResponse(error), 'error');

			}
		);
	}
}