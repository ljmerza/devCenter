import { Component, Input, OnInit } from '@angular/core';
import { NgRedux } from '@angular-redux/store';

import { Actions, RootState } from '@store';
import { JiraService, ToastrService, ConfigService } from '@services';

@Component({
	selector: 'dc-crucible',
	templateUrl: './crucible.component.html',
	styleUrls: ['./crucible.component.scss']
})
export class CrucibleComponent {

	constructor(public jira: JiraService, public config: ConfigService, public toastr: ToastrService, public store:NgRedux<RootState>) { }

	@Input() key;
	crucibleId$;
	crucibleId;

	/**
	* Adds watcher for Crucible Id.
	*/
	ngOnInit(){
		this.crucibleId$ = this.store.select('crucibleId')
		.subscribe((allTickets:any) => this.crucibleId = allTickets.find(ticket => ticket.key === this.key).crucibleId);
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

  		// change 'status' (add user to crucible then open crucible)
  		this.jira.changeStatus({key:this.key, statusType:'pcrAdd', crucible_id:this.crucibleId})
		.subscribe(
			() => {
				// open crucible if successfully joined
				let win = window.open(`${this.config.crucibleUrl}/cru/${this.crucibleId}`, '_blank');
		  		win.focus();
			},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

}
