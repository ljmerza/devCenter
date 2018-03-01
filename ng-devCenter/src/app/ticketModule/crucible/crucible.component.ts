import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgRedux } from '@angular-redux/store';

import { Actions, RootState } from '@store';
import { JiraService, ToastrService, ConfigService } from '@services';

@Component({
	selector: 'dc-crucible',
	templateUrl: './crucible.component.html',
	styleUrls: ['./crucible.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrucibleComponent {

	constructor(public jira: JiraService, public config: ConfigService, public toastr: ToastrService, public store:NgRedux<RootState>, private cd: ChangeDetectorRef) { }

	@Input() key;
	crucibleId$;
	crucibleId;

	/**
	* Adds watcher for Crucible Id.
	*/
	ngOnInit(){
		this.crucibleId$ = this.store.select('crucibleIds')
		.subscribe((allTickets:any) => {
			this.crucibleId = allTickets.find(ticket => ticket.key === this.key).crucibleId;
			this.cd.detectChanges();
		});
	}

	/**
	* removes watcher for Crucible Id.
	*/
	ngOnDestroy(){
		if(this.crucibleId$) this.crucibleId$.unsubscribe();
	}

	/**
	* Adds the currently logged in user as a reviewer to the Crucible review.
	*/
	addReviewer():void {
  		this.jira.changeStatus({key:this.key, statusType:'pcrAdd', crucible_id:this.crucibleId})
		.subscribe(
			() => window.open(`${this.config.crucibleUrl}/cru/${this.crucibleId}`, '_blank').focus(),
			this.jira.processErrorResponse.bind(this.jira)
		);
	}
}
