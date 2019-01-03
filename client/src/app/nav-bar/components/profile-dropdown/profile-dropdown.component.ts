import {Component, OnInit, ViewChild} from '@angular/core';
import {Store, select} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {selectSettings} from '@app/settings/settings.selectors';
import {ActionProfile, selectProfile} from '@app/core/profile';
import {ActionStatusRetrieve} from '@app/nav-bar/actions';
import {PanelComponent} from '@app/panel/components/panel/panel.component';

@Component({
	selector: 'dc-profile-dropdown',
	templateUrl: './profile-dropdown.component.html',
	styleUrls: ['./profile-dropdown.component.css'],
})
export class ProfileDropdownComponent implements OnInit {
	profile;
	private profile$: Subscription;
	private settings$: Subscription;
	@ViewChild(PanelComponent) modal: PanelComponent;

	constructor(public store: Store<{}>) {}

	ngOnInit(): void {
		// get credential settings - anytime they change -> retrieve new profile
		// also get the user's status changes for Jira
		this.settings$ = this.store
			.pipe(
				select(selectSettings),
				distinctUntilChanged((prev, next) => prev.username === next.username && prev.password === next.password)
			)
			.subscribe(settings => {
				if (settings.password && settings.username) {
					this.store.dispatch(new ActionProfile());
				}
			});

		this.store.dispatch(new ActionStatusRetrieve());
		this.profile$ = this.store.pipe(select(selectProfile)).subscribe(profile => (this.profile = profile));
	}

	ngOnDestroy(): void {
		this.settings$.unsubscribe();
		this.profile$.unsubscribe();
	}
}
