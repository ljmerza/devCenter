import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { selectSettings } from '@app/settings/settings.selectors';
import { ActionProfile, selectProfile } from '@app/core/profile';
import { ActionStatusRetrieve } from '@app/nav-bar/actions';
import { ActionSettingsPersist } from '@app/settings/settings.actions';

import { initialState } from '@app/settings/settings.reducer';
import { PanelComponent } from '@app/panel/components/panel/panel.component';
import { NotificationService } from '@app/core/notifications/notification.service';

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

	constructor(public store: Store<{}>, private router: Router, private notificationsService: NotificationService) {}

	ngOnInit(): void {

		// get credential settings - anytime they change -> retrieve new profile
		// also get the user's status changes for Jira
    	this.settings$ = this.store.pipe(
    		select(selectSettings),
    		distinctUntilChanged((prev, next) => prev.username === next.username && prev.password === next.password)
    	)
		.subscribe(() => {
			this.store.dispatch(new ActionProfile());
			this.store.dispatch(new ActionStatusRetrieve());
		});

    	this.profile$ = this.store.pipe(select(selectProfile)).subscribe(profile => this.profile = profile);
    }

	ngOnDestroy(): void {
		this.settings$.unsubscribe();
		this.profile$.unsubscribe();
	}
	
	logout(): void {
		this.notificationsService.info('Erasing settings and logging out');
		this.store.dispatch(new ActionSettingsPersist({...initialState}));
		this.router.navigate(['/settings']);
	}

}