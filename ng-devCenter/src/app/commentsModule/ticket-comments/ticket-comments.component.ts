import { 
	Component, ViewChild, ElementRef, EventEmitter, AfterViewInit,
	ViewEncapsulation, Input, Output, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { RootState } from './../../shared/store/store';

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
	openPanelIds = [];
	commentId;
	modalRef;
	customModalCss = 'ticketComment';

	@ViewChild(ModalComponent) modal: ModalComponent;
	@Input() key;
	@Input() comments;
	@Input() attachments;
	@Output() commentChangeEvent = new EventEmitter();
	commentsRedux$;

	constructor(
		private toastr: ToastrService, public user:UserService, 
		public jira:JiraService, private misc: MiscService,
		store: NgRedux<RootState>
	) {
		console.log('store: ', store);
	}

	/**
	*/
	ngOnInit() {
		this.formatComments();
		// this.commentsRedux$ = this.store.select(this.commentSelector);

		this.commentsRedux$.subscribe(comments => {
			console.log('comments: ', comments);
		});
	}

	commentSelector(state) {
		console.log('state: ', state);
		let comments = state.tickets.map(ticket => ticket.comments)
		console.log('comments: ', comments, this.key);

		comments.filter(comments => {
			comments.length > 0 && comments[0].key === this.key
		});

		return comments;
	}

	/**
	 *
	 *
	 */
	formatComments(){
		this.comments = this.comments.map(comment => {
			comment.isEditing = false;
			comment.closeText = 'Edit Comment';
			comment.editId = 'E'+comment.id.toString();
			return comment;
		});

		// only open the last comment section
		this.openPanelIds = [`${this.key}${this.comments.length-1}`];
	}

	/**
	*/
	ngAfterViewInit(): void {
		const self=this;
		
		setTimeout(() => {
			// highlight code needs to be triggered after modal opens
			$('pre').each(function(i, block) {
				hljs.highlightBlock(block);
			});

			// for each table item add click event for copying text
			$('.tableCopy').each(function(i, block) {
				$(this).click(function(){
					self.misc.copyText( $(this).children('input').get(0) );
				});
			});
		});
	}

	/**
	*/
	toggleEditing(comment){
		comment.isEditing = !comment.isEditing;
		comment.closeText = comment.closeText == 'Cancel Editing' ? 'Edit Comment' : 'Cancel Editing';
	}

	/**
	*/
	deleteComment(commentId) {
		this.commentId = commentId;
		// open delete modal
		this.modalRef = this.modal.openModal();
	}

	/**
	*/
	closeDeleteModal(deleteComment?){

		this.modalRef.close();
		if(!deleteComment) return;

		// get index of comment and remove it from comments input var
		const pos = this.comments.map(comm =>	comm.id).indexOf(this.commentId);
		const deletedComment = this.comments.splice(pos, 1);

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

				this.comments = this.comments.map(comment => {
					// if id match save new comment details
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