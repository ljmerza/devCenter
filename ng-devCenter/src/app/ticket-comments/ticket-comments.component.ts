import { 
	Component, ViewChild, ElementRef, EventEmitter, AfterViewInit,
	ViewEncapsulation, Input, Output, OnInit, ChangeDetectionStrategy
} from '@angular/core';

import { ModalComponent } from './../modal/modal.component';
import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';
import { UserService } from './../services/user.service';
import { MiscService } from './../services/misc.service';

declare var hljs :any;
declare var $ :any;

@Component({
	selector: 'dev-center-ticket-comments',
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

	constructor(
		private toastr: ToastrService, public user:UserService,
		public jira:JiraService, private misc: MiscService
	) {}

	/**
	*/
	ngOnInit() {
		// add isEditing boolean to each comments
		this.comments = this.comments.map(comment => {
			comment.isEditing = false;
			comment.closeText = 'Edit Comment';
			comment.editId = 'E'+comment.id.toString();
			return comment;
		});

		this.openPanelIds = this.comments.map((c,i) => {
			if(this.comments.length<6 || (this.comments.length>6 && i>this.comments.length-4)){
				return `${this.key}${i}`;
			}
		});
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
		// open modal
		this.modalRef = this.modal.openModal()
	}

	/**
	*/
	closeDeleteModal(deleteComment){

		this.modalRef.close();
		if(!deleteComment) return;

		// get index of comment and remove it there
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
			() => {
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