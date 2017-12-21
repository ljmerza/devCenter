import { 
	Component, ViewChild, ElementRef, EventEmitter,
	ViewEncapsulation, Input, Output, OnInit, ChangeDetectionStrategy
} from '@angular/core';

import { NgbModal, NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';
import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';
import { UserService } from './../services/user.service';

declare var hljs :any;
declare var $ :any;

@Component({
	selector: 'app-jira-comments',
	templateUrl: './jira-comments.component.html',
	styleUrls: ['./jira-comments.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class JiraCommentsComponent implements OnInit {
	modalReference;
	openPanelIds = [];

	@ViewChild('commentModal') content:ElementRef;
	@ViewChild('deleteModal') deleteModal: ElementRef;
	@Input() key;
	@Input() comments;
	@Input() attachments;
	@Output() commentChangeEvent = new EventEmitter();

	constructor(
		private modalService:NgbModal, 
		private toastr: ToastrService, 
		public config: NgbAccordionConfig, 
		public jira:JiraService,
		public user:UserService
	) {}

	ngOnInit() {

		// add isEditing boolean to each comments
		this.comments = this.comments.map(comment => {
			comment.isEditing = false;
			comment.closeText = 'Edit Comment';
			comment.editId = 'E'+comment.id.toString();
			return comment;
		});
	}

  	/*
  	*/
	openCommentModal(): void {

		// open all panels if less than 6 else open last three
		this.openPanelIds = this.comments.map((c,i) => {
			if(this.comments.length<6 || (this.comments.length>6 && i>this.comments.length-4)){
				return `${this.key}${i}`;
			}
		});

		// open modal
		this.modalReference = this.modalService
			.open(this.content, { windowClass: 'qa-modal' });

		// highlight code needs to be triggered after modal opens
		// so set call to initializer to back of event loop
		setTimeout( () => {
			$('pre').each(function(i, block) {
				hljs.highlightBlock(block);
			});
		},0);
	}

	/*
	*/
	toggleEditing(comment){
		comment.isEditing = !comment.isEditing;
		comment.closeText = comment.closeText == 'Cancel Editing' ? 'Edit Comment' : 'Cancel Editing';
	}

	/*
	*/
	deleteComment(comment_id) {
		this.modalService.open(this.deleteModal).result.then( () => {

			// get index of comment and remove it there
			const pos = this.comments.map(comm =>  comm.id).indexOf(comment_id);
			const deletedComment = this.comments.splice(pos, 1);

			this.jira.deleteComment(comment_id, this.key).subscribe(
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
		});
	}

	/*
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
