import { Component, Input, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { Store, select } from '@ngrx/store';

import { PanelComponent } from '@app/panel/components/panel/panel.component';
import { Subscription } from 'rxjs';
import { map, tap, distinctUntilChanged } from 'rxjs/operators';

import { selectSettings } from '@app/settings/settings.selectors';

import { selectJiraState } from '../../selectors';
import { ActionCommentEdit, ActionCommentDelete } from '../../actions';
import { JiraTicketsState, JiraTicket } from '../../models';

import { MatAccordion } from '@angular/material/expansion';

@Component({
	selector: 'dc-comments',
	templateUrl: './comments.component.html',
	styleUrls: ['./comments.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CommentsComponent implements OnInit, OnDestroy {
	ticket: any;
	ticket$: Subscription;
	loading: boolean = false;
	isAllOpen: boolean = false;

	commentEditingId:string = '';
	commentEditingText: string = '';
	deleteCommentId: string = '';

	settings = {};
	settings$: Subscription;

	@Input() key;
	@ViewChild(PanelComponent) modal: PanelComponent;
	@ViewChild('deleteModal') deleteModal: PanelComponent;

	@ViewChild(MatAccordion) matAccordion: MatAccordion;

	constructor(public store: Store<{}>) { }

	ngOnInit() {
		this.settings$ = this.store.pipe(select(selectSettings), distinctUntilChanged())
			.subscribe(settings => this.settings = settings);

		this.ticket$ = this.store.pipe(
			select(selectJiraState),
			tap(state => {
				if(this.loading) this.loading = state.commentsLoading;
			}),
			map((state:JiraTicketsState) => state.commentsTickets.find(ticket => ticket.key === this.key)),
			distinctUntilChanged()
		)
			.subscribe((ticket: JiraTicket) => this.ticket = ticket);
	}

	ngOnDestroy() {
		this.ticket$.unsubscribe();
		this.settings$.unsubscribe();
	}

	/**
	 * toggle comment editing
	 * @param {Comment} comment the comment to edit
	 */
	toggleEditing(comment){
		if(this.commentEditingId === comment.id){
			this.commentEditingId = '';
			this.commentEditingText = '';
		} else {
			this.commentEditingId = comment.id;
			this.commentEditingText = comment.raw_comment;
		}
	}

	/**
	 * saves the edited comment
	 */
	editComment(){
		this.loading = true;

		this.store.dispatch(new ActionCommentEdit({
			comment: this.commentEditingText,
			commentId: this.commentEditingId,
			key: this.key
		}));

		this.commentEditingId = '';
		this.commentEditingText = '';
	}

	/**
	 * saves the comment id you want to delete then open confirm dialog
	 * @param {string} commentId
	 */
	deleteComment(commentId){
		this.deleteCommentId = commentId;
		this.deleteModal.openModal();
	}

	/**
	 * opens confirmation dialog to delete a comment
	 */
	deleteCommentConfirm(){
		this.loading = true;
		this.store.dispatch(new ActionCommentDelete({commentId: this.deleteCommentId, key: this.key}));
		this.deleteModal.closeModal();
	}

	/**
	 * toggles all comment panels open or closed
	 */
	toggleAllPanels(){
		if(this.isAllOpen){
			this.isAllOpen = false;
			this.matAccordion.closeAll();
		} else {
			this.isAllOpen = true;
			this.matAccordion.openAll();
		}
	}

}
