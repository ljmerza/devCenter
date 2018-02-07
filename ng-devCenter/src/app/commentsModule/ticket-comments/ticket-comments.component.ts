import { 
	Component, ViewChild, AfterViewChecked, ChangeDetectorRef,
	ViewEncapsulation, Input, Output, OnInit, ChangeDetectionStrategy, OnDestroy
} from '@angular/core';

import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Observable, Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import { RootState } from './../../shared/store/store';
import { Actions } from './../../shared/store/actions';

import { Comment } from './../../shared/store/models/Comment';
import { Ticket } from './../../shared/store/models/ticket';
import { Attachment } from './../../shared/store/models/attachment';

import { ModalComponent } from './../../shared/modal/modal.component';
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';
import { UserService } from './../../shared/services/user.service';
import { MiscService } from './../../shared/services/misc.service';

declare const hljs:any;
declare const $:any;

@Component({
	selector: 'dc-ticket-comments',
	templateUrl: './ticket-comments.component.html',
	styleUrls: ['./ticket-comments.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketCommentsComponent implements OnInit, AfterViewChecked, OnDestroy {
	commentId:string;
	modalRef:NgbModalRef;
	customModalCss:string = 'ticketComment';
	comments:Array<Comment>;
	attachments:Array<Attachment>;

	@ViewChild(ModalComponent) modal: ModalComponent;
	@Input() key:string;
	comments$:Subscription;
	attachments$:Subscription;

	constructor(
		private toastr: ToastrService, private user:UserService, private jira:JiraService, 
		private misc: MiscService, private store:NgRedux<RootState>, private cd: ChangeDetectorRef 
	) { }

	/**
	 * On init of this component instance listen for ticket events from Redux.
	 */
	ngOnInit():void {
		this.syncComments();
		this.syncAttachments();
	}

	/**
	 * on destroy of component unsubscribe any observables.
	 */
	ngOnDestroy():void {
		if(this.comments$) this.comments$.unsubscribe();
		if(this.attachments$) this.attachments$.unsubscribe();
	}

	/**
	 * add code highlighting to each comment and add copy text
	 * functionality to each table item
	 */
	ngAfterViewChecked():void {
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
		this.comments$ = this.store.select('tickets')
		.map( (tickets:Array<Ticket>) =>{

			console.log('this.key: ', this.key);
			const ticket = tickets.find((ticket:Ticket) => ticket.key === this.key);
			return ticket.comments;
		}).subscribe( (comments:Array<Comment>) =>{
			this.comments = comments;
			this.cd.detectChanges();
		});
	}
	private syncAttachments():void {
		this.attachments$ = this.store.select('tickets')
		.map( (tickets:Array<Ticket>) =>{ 
			const ticket = tickets.find((ticket:Ticket) => ticket.key === this.key);
			return ticket.attachments;
		}).subscribe( (attachments:Array<Attachment>) => this.attachments = attachments);
	}

	/**
	 * saves commentId and opens verify dialog for deletion of comment
	 * @param {String} commentId the comment ID of the comment to delete
	 */
	private deleteComment(commentId:string):void {
		this.commentId = commentId;
		// open delete modal
		this.modalRef = this.modal.openModal();
	}

	/**
	 * If delete confirmation then remove comment from comments
	 * array and send commentId to API to persist delete
	 * @param {Boolean} deleteComment do we delete the comment?
	 */
	public closeDeleteModal(deleteComment?:boolean):void {
		this.modalRef.close();
		if(!deleteComment) return;

		// this.jira.deleteComment(this.commentId, this.key)
		// .subscribe((response:any) => {
			console.log('test: ');
				this.store.dispatch({ type: Actions.deleteComment, payload: {key: this.key, id: this.commentId} });
			// },
			// this.jira.processErrorResponse.bind(this)
		// );
	}

	/**
	 * Edits a comment's body
	 * @param {Comment} comment the comment object to edit
	 */
	public editComment(comment:Comment):void {

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
		this.jira.editComment(postData)
		.subscribe((response:any) => {

				// get new comment and add what ticket it belongs to
				let payload = response.data;
				payload.key = postData.key;

				// update redux and show toast
				this.store.dispatch({ type: Actions.editComment, payload });
				this.toastr.showToast('Comment Deleted Successfully', 'success');
			},
			this.jira.processErrorResponse.bind(this)
		);
	}

	/**
	 * toggle editing boolean on a comment object and change close text
	 * based on editing or not
	 * @param {Comment} comment the comment to change editing values on
	 */
	private toggleEditing(comment:Comment):void {
		comment.isEditing = !comment.isEditing;
		comment.closeText = comment.closeText == 'Cancel Editing' ? 'Edit Comment' : 'Cancel Editing';
	}
}