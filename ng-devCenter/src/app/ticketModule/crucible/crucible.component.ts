import {
	Component, Input, ChangeDetectionStrategy, ChangeDetectorRef,
	OnDestroy, OnInit, ViewContainerRef, ComponentFactoryResolver
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { select, NgRedux } from '@angular-redux/store';
import { RootState } from '@store';
import { JiraService, ToastrService, ConfigService, ChatService } from '@services';
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
		public jira: JiraService, public config: ConfigService, public toastr: ToastrService, public chat: ChatService,
		private cd: ChangeDetectorRef, public store: NgRedux<RootState>, public route: ActivatedRoute,
		private viewContRef: ViewContainerRef, private factoryResolver: ComponentFactoryResolver,
	) { }

	@Input() key;
	ticketListType;
	crucibleId$;
	crucibleId;

	crucibleCommentsComponentRef;
	alreadyPinged: boolean = false;

	/**
	* Get crucible Id from store.
	*/
	ngOnInit() {
		this.route.paramMap.subscribe((routeResponse: any) => {
			this.ticketListType = routeResponse.params.filter || 'mytickets';

			this.crucibleId$ = this.store.select(`${this.ticketListType}_crucible`)
				.subscribe((allTickets: any = []) => {
					const ticket = allTickets.find(ticket => ticket.key === this.key) || {};
					this.crucibleId = ticket.crucible_id || '';
					this.cd.markForCheck();
				});

		});
	}

	/**
	 *
	 */
	ngOnDestroy() {
		if (this.crucibleId$) this.crucibleId$.unsubscribe();
	}

	/**
	* Adds the currently logged in user as a reviewer to the Crucible review. 
	* Always open crucible even if reviewer add fails.
	* @return {boolean} returns false to stop bubbling
	*/
	addReviewer(): boolean {
		this.jira.changeStatus({ key: this.key, statusType: statuses.PCRADD.backend, crucible_id: this.crucibleId })
			.subscribe(
				() => {
					this.toastr.showToast(`Added as a reviwer to ${this.crucibleId}`, 'info');
					this.openCrucible();
				},
				error => {
					this.jira.processErrorResponse(error);
					this.openCrucible();
				}
			);

		return false;
	}

	/**
	 * Tries to open a new window for the Crucible link
	 */
	openCrucible() {
		const newWindow = window.open(`${this.config.crucibleUrl}/cru/${this.crucibleId}`, '_blank');

		if (newWindow) {
			newWindow.focus();
		} else {
			this.toastr.showToast(`Could not open new window. Maybe you blocked the new window?`, 'error');
		}
	}

	/**
	 * 
	 */
	pingPcrNeeded() {

		if (this.alreadyPinged) {
			this.toastr.showToast(`You've already pinged the chatroom for ${this.crucibleId}.`, 'error');
			return;
		}

		this.alreadyPinged = true;
		this.toastr.showToast(`Pinging chatroom for PCR needed on ${this.crucibleId}.`, 'info');

		const postData = {
			key: this.key,
			ping_type: statuses.PCRNEED.backend
		};

		this.chat.sendPing(postData).subscribe(
			() => {
				this.toastr.showToast(`Pinged chatroom for PCR needed on ${this.crucibleId}.`, 'info');
			},
			error => {
				this.jira.processErrorResponse(error);
			}
		);
	}

	/**
	 *
	 */
	openCrucibleComments() {
		if (!this.crucibleCommentsComponentRef) {
			const factory = this.factoryResolver.resolveComponentFactory(CrucibleCommentsModalComponent);
			this.crucibleCommentsComponentRef = this.viewContRef.createComponent(factory);
			(<CrucibleCommentsModalComponent>this.crucibleCommentsComponentRef.instance).crucibleId = this.crucibleId;
		}
		(<CrucibleCommentsModalComponent>this.crucibleCommentsComponentRef.instance).modal.openModal();
	}
}