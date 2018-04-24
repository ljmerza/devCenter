import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';

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

	constructor(public jira: JiraService, public config: ConfigService, public toastr: ToastrService, private cd: ChangeDetectorRef, public store:NgRedux<RootState>) { }

	@Input() key;
	@Input() ticketListType;
	crucibleId$;
	crucibleId;

	/**
	* Adds watcher for Crucible Id.
	*/
	ngOnInit(){
		this.crucibleId$ = this.store.select(this.ticketListType)
		.subscribe((allTickets:any=[]) => {
			const ticket = allTickets.find(ticket => ticket.key === this.key) || {};
			this.crucibleId = ticket.crucible_id || '';
			this.cd.detectChanges();
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
  		this.jira.changeStatus({key:this.key, statusType:statuses.PCRADD.backend, crucibleId:this.crucibleId})
		.subscribe(
			() => window.open(`${this.config.crucibleUrl}/cru/${this.crucibleId}`, '_blank').focus(), 
			this.jira.processErrorResponse.bind(this)
		);

		return false;
	}
}
