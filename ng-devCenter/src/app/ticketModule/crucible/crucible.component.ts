import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgRedux } from '@angular-redux/store';

import { Actions, RootState } from '@store';
import { JiraService, ToastrService, ConfigService } from '@services';
import { statuses } from '@models';

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
			const ticket = allTickets.find(ticket => ticket.key === this.key);
			if(ticket && this.crucibleId !== ticket.crucibleId){
				this.crucibleId = ticket.crucibleId;
				this.cd.detectChanges();
			}
			
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
	* Always open crucible even if reviewer add fails.
	* @return {boolean} returns false to stop bubbling
	*/
	addReviewer():boolean {
  		this.jira.changeStatus({key:this.key, statusType:statuses.PCRADD.backend, crucible_id:this.crucibleId})
		.subscribe(this.openCrucible.bind(this), this.openCrucible.bind(this));
		return false;
	}

	/**
	 * Opens crucible review in new window.
	 */
	openCrucible(){
		window.open(`${this.config.crucibleUrl}/cru/${this.crucibleId}`, '_blank').focus();
	}
}
