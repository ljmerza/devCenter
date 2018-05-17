import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { select, NgRedux } from '@angular-redux/store';
import { RootState } from '@store';
import { JiraService, ToastrService, ConfigService } from '@services';
import { statuses } from '@models';

@Component({
	selector: 'dc-crucible',
	templateUrl: './crucible.component.html',
	styleUrls: ['./crucible.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrucibleComponent implements OnDestroy, OnInit {

	constructor(
		public jira: JiraService, public config: ConfigService, public toastr: ToastrService, 
		private cd: ChangeDetectorRef, public store:NgRedux<RootState>, public route:ActivatedRoute
	) { }

	@Input() key;
	ticketListType;
	crucibleId;
	crucibleId$;

	/**
	* Get crucible Id from store.
	*/
	ngOnInit(){
		this.route.paramMap.subscribe((routeResponse:any) => {
			this.ticketListType = routeResponse.params.filter || 'mytickets';

			this.crucibleId$ = this.store.select(`${this.ticketListType}_crucible`)
			.subscribe((allTickets:any=[]) => {
				const ticket = allTickets.find(ticket => ticket.key === this.key) || {};
				this.crucibleId = ticket.crucible_id || '';
				this.cd.markForCheck();
			});

		});
	}

	/**
	 *
	 */
	ngOnDestroy(){
		if(this.crucibleId$) this.crucibleId$.unsubscribe();
	}

	/**
	* Adds the currently logged in user as a reviewer to the Crucible review. 
	* Always open crucible even if reviewer add fails.
	* @return {boolean} returns false to stop bubbling
	*/
	addReviewer():boolean {
  		this.jira.changeStatus({key:this.key, statusType:statuses.PCRADD.backend, crucible_id:this.crucibleId})
		.subscribe(
			() => {
				this.toastr.showToast(`Added as a reviwer to ${this.crucibleId}`, 'info')
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
	openCrucible(){
		const newWindow = window.open(`${this.config.crucibleUrl}/cru/${this.crucibleId}`, '_blank');

		if(newWindow){
			newWindow.focus();
		} else {
			this.toastr.showToast(`Could not open new window. Maybe you blocked the new window?`, 'error');
		}
	}
}