import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { JiraService, ToastrService, ConfigService } from '@services';
import { statuses } from '@models';

@Component({
	selector: 'dc-crucible',
	templateUrl: './crucible.component.html',
	styleUrls: ['./crucible.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrucibleComponent {

	constructor(public jira: JiraService, public config: ConfigService, public toastr: ToastrService, private cd: ChangeDetectorRef) { }

	@Input() key;
	@Input() crucibleId;

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
