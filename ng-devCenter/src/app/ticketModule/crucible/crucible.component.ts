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
		public config: ConfigService, public toastr: ToastrService, public chat: ChatService,
		private cd: ChangeDetectorRef, public store: NgRedux<RootState>, public route: ActivatedRoute,
	) { }

	@Input() key;
	ticketListType: string;
	pullRequests: Array<any>;
	toUsername: string;
	displayName: string;

	codeCloud$;
	userProfile$;

	/**
	* Get crucible Id from store.
	*/
	ngOnInit() {
		this.route.paramMap.subscribe((routeResponse: any) => {
			this.ticketListType = routeResponse.params.filter || 'mytickets';

			this.codeCloud$ = this.store.select(`${this.ticketListType}_codeCloud`)
				.subscribe((allTickets: any = []) => {
					const ticket = allTickets.find(ticket => ticket.key === this.key) || {};
					this.toUsername = ticket.username || '';
					this.pullRequests = ticket.pullRequests || '';
				});
			
			this.userProfile$ = this.store.select(`userProfile`)
				.subscribe((profile:any) => {
					this.displayName = profile.displayName || '';
				});
		});
	}

	/**
	 *
	 */
	ngOnDestroy() {
		if (this.codeCloud$) this.codeCloud$.unsubscribe();
		if (this.userProfile$) this.userProfile$.unsubscribe();
	}

	/**
	 *
	 */
	pingPcrCommentsAddressing(){
		const postData = {
			fromName: this.displayName,
			toUsername: this.toUsername,
			pullLinks: this.pullRequests,
			key: this.key,
		};

		this.chat.sendPcrComments(postData).subscribe(
			response => this.toastr.showToast(response.data, 'success'),
			error => this.toastr.showToast(`Could not ping user: ${error.data}`, 'error')
		)
	}
}