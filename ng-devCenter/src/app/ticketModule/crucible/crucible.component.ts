import {
	Component, Input, ChangeDetectionStrategy, ChangeDetectorRef,
	OnDestroy, OnInit, ViewContainerRef, ComponentFactoryResolver
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { select, NgRedux } from '@angular-redux/store';
import { RootState } from '@store';
import { JiraService, ToastrService, ConfigService, ChatService, UserService } from '@services';
import { statuses } from '@models';

import { CrucibleCommentsModalComponent } from '../../commentsModule/crucible-comments-modal/crucible-comments-modal.component'

@Component({
	selector: 'dc-crucible',
	templateUrl: './crucible.component.html',
	styleUrls: ['./crucible.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	entryComponents: [CrucibleCommentsModalComponent]
})
export class CrucibleComponent implements OnDestroy, OnInit {

	constructor(
		public jira: JiraService, public config: ConfigService, public toastr: ToastrService, 
		private cd: ChangeDetectorRef, public store: NgRedux<RootState>, public route: ActivatedRoute,
		private user: UserService, public chat: ChatService,
	) { }

	@Input() key;
	ticketListType: string;
	pullRequests: Array<any>;
	fromUsername: string;
	fromName: string;

	codeCloud$

	/**
	* Get crucible Id from store.
	*/
	ngOnInit() {
		this.route.paramMap.subscribe((routeResponse: any) => {
			this.ticketListType = routeResponse.params.filter || 'mytickets';

			this.codeCloud$ = this.store.select(`${this.ticketListType}_codeCloud`)
				.subscribe((allTickets: any = []) => {
					const ticket = allTickets.find(ticket => ticket.key === this.key) || {};
					this.fromUsername = ticket.userDetails.username || '';
					this.fromName = ticket.userDetails.display_name || '';
					this.pullRequests = ticket.pullRequests || '';
				});

		});
	}

	/**
	 *
	 */
	ngOnDestroy() {
		if (this.codeCloud$) this.codeCloud$.unsubscribe();
	}

	/**
	 *
	 */
	pingPcrCommentsAddressing(){
		let postData = {
			fromUsername: this.fromUsername,
			fromName: this.fromName,
			toUsername: this.user.username,
			pullLinks: this.pullRequests,
			key: this.key,
		};

		console.log({postData});

		this.chat.sendPcrComments(postData).subscribe(
			response => this.toastr.showToast(response.data, 'success'),
			error => this.toastr.showToast(`Could not ping user: ${error.data}`, 'error')
		)
	}
}