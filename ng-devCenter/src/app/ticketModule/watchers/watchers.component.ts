import { Component, OnInit, Input, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { JiraWatchersService, ToastrService, UserService } from '@services';

@Component({
	selector: 'dc-watchers',
	templateUrl: './watchers.component.html',
	styleUrls: ['./watchers.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class WatchersComponent implements OnInit {

	@Input() watchers;
	@Input() key;
	isSelfWatcher:boolean = false;
	modifyType:string = 'add';

	constructor(private watcher: JiraWatchersService, private toastr: ToastrService, private user: UserService, private cd: ChangeDetectorRef) { }

	/**
	 *
	 */
	ngOnInit(){
		this.isSelfWatcher = this.watchers.find(watcher => watcher.username === this.user.username); 
		console.log('this.watchers: ', this.watchers, this.key, this.isSelfWatcher);
		this.updateModifyString();
	}

	/**
	 *
	 */
	updateModifyString(){
		this.modifyType = this.isSelfWatcher ? 'Remove' : 'Add';
	}

	/**
	 *
	 */
	toggleWatcher(){
		if(this.isSelfWatcher){
			this.removeWatcher();
		} else {
			this.addWatcher();
		}
	}

	/**
	 *	Adds self as a watcher to this ticket
	 */
	addWatcher(){
		this.watcher.addWatcher(this.key)
		.subscribe(
			response => {
				this.toastr.showToast('Successfully added as a watcher', 'success');
				this.isSelfWatcher = true;
				this.updateModifyString();
			},
			error => this.toastr.showToast(this.watcher.processErrorResponse(error), 'error')
		)
	}

	/**
	 * Removes self as a watcher from this ticket
	 */
	removeWatcher(){
		this.watcher.removeWatcher(this.key)
		.subscribe(
			response => {
				this.toastr.showToast('Successfully removed as a watcher', 'success');
				this.isSelfWatcher = false;
				this.updateModifyString();
			},
			error => this.toastr.showToast(this.watcher.processErrorResponse(error), 'error')
		)
	}

}
