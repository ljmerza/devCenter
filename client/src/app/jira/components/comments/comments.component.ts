import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { environment as env } from '@env/environment';

import { PanelComponent } from '@app/panel/components/panel/panel.component';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { selectSettings } from '@app/settings/settings.selectors';

import { ActionBranchInfoRetrieve } from '../../actions';
import { selectJiraState } from '../../selectors';
import { JiraTicketsState, JiraTicket } from '../../models';

@Component({
	selector: 'dc-comments',
	templateUrl: './comments.component.html',
	styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
	env = env;
	ticket: any;
	ticket$: Subscription;
	loading: boolean = false;

	settings = {};
	settings$;

	@Input() key;
	@ViewChild(PanelComponent) modal: PanelComponent;

	constructor(public store: Store<{}>) { }

	ngOnInit() {
		this.settings$ = this.store.pipe(select(selectSettings))
			.subscribe(settings => this.settings = settings);

		this.ticket$ = this.store.pipe(
			select(selectJiraState),
			tap(state => {
				if(this.loading) this.loading = state.commentsLoading;
			}),
			map((state:JiraTicketsState) => state.commentsTickets.find(ticket => ticket.key === this.key))
		)
			.subscribe((ticket: JiraTicket) => this.ticket = ticket);
	}

	ngOnDestroy() {
		this.ticket$.unsubscribe();
		this.settings$.unsubscribe();
	}

	toggleEditing(comment){
		comment.isEditing = !comment.isEditing;
	}

	editComment(comment){

	}

	deleteComment(commentId){

	}

}
