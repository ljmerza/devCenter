import { 
	Component, ViewChild, ElementRef, EventEmitter, AfterViewInit, ChangeDetectorRef,
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
		private toastr: ToastrService, private user:UserService, private jira:JiraService, 
		private misc: MiscService, private store:NgRedux<RootState>, private cd: ChangeDetectorRef 
	) { }

	/**
	 * On init of this component instance listen for tickets event from Redux.
	 */
	ngOnInit():void {
		this.syncComments();
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
	 * listen for tickets event from Redux and extracts the comments for this ticket.
	 */
	private syncComments():void {
		this.commentsRedux$ = this.store.select('tickets')
		.map( (tickets:Array<Ticket>) =>{ 
			const ticket = tickets.find(ticket => ticket.key === this.key);
			return ticket.comments;
		})
		.subscribe(comments =>{
			this.comments = comments;
			console.log('comments: ', comments);
			this.cd.detectChanges();
		});
	}

	/**
	 * saves commentId and opens verify dialog for deletion of comment
	 * @param {String} commentId the comment ID of the comment to delete
	 */
	private deleteComment(commentId) {
		this.commentId = commentId;
		// open delete modal
		this.modalRef = this.modal.openModal();
	}

	/**
	 * If delete confirmation then remove comment from comments
	 * array and send commentId to API to persist delete
	 * @param {Boolean} deleteComment do we delete the comment?
	 */
	public closeDeleteModal(deleteComment?){

		this.modalRef.close();
		if(!deleteComment) return;

		this.jira.deleteComment(this.commentId, this.key);
	}

	/**
	 * Edits a comment's body
	 * @param {Comment} comment the comment object to edit
	 */
	public editComment(comment){

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
		this.jira.editComment(postData);
	}

	/**
	 * toggle editing boolean on a comment object and change close text
	 * based on editing or not
	 * @param {Comment} comment the comment to change editing values on
	 */
	private toggleEditing(comment){
		comment.isEditing = !comment.isEditing;
		comment.closeText = comment.closeText == 'Cancel Editing' ? 'Edit Comment' : 'Cancel Editing';
	}
}