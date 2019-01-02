import {Component, OnInit, OnDestroy, ChangeDetectionStrategy, Input, ViewChild} from '@angular/core';
import {Store, select} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {selectSettings} from '@app/settings/settings.selectors';

import {PanelComponent} from '@app/panel/components/panel/panel.component';
import {ActionBranchInfoPing} from '../../actions';
@Component({
	selector: 'dc-branch-info',
	templateUrl: './branch-info.component.html',
	styleUrls: ['./branch-info.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchInfoComponent implements OnInit, OnDestroy {
	@Input() sprint = '';
	@Input() branch = '';
	@Input() commit = '';
	@Input() key = '';
	@Input() epicLink = '';

	settings: any = {};
	settings$: Subscription;
	@ViewChild(PanelComponent) modal: PanelComponent;

	constructor(public store: Store<{}>) {}

	ngOnInit() {
		this.settings$ = this.store
			.pipe(
				select(selectSettings),
				distinctUntilChanged()
			)
			.subscribe(settings => (this.settings = settings));
	}

	ngOnDestroy() {
		this.settings$.unsubscribe();
	}

	/**
	 * sends a new ticket ping to a user
	 */
	sendNewPing() {
		this.store.dispatch(new ActionBranchInfoPing(this.createPingBody('new')));
	}

	/**
	 * sends a merge ticket ping to a user
	 */
	sendMergePing() {
		this.store.dispatch(new ActionBranchInfoPing(this.createPingBody('merge')));
	}

	/**
	 * creates payload for ping effect
	 * @param {string} pingType - new or merge
	 */
	private createPingBody(pingType: string) {
		return {
			key: this.key,
			pingType,
			epicLink: this.epicLink,
			username: this.settings.username,
		};
	}
}
