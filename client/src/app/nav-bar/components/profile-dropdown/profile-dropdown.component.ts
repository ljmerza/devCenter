import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { selectSettings } from '@app/settings/settings.selectors';
import { selectProfile } from '@app/nav-bar/nav-bar.selectors';
import { ActionProfileRetrieve } from '@app/nav-bar/nav-bar.actions';

import { ActionSettingsPersist } from '@app/settings/settings.actions';
import { initialState } from '@app/settings/settings.reducer';
import { PanelComponent } from '@app/panel/components/panel/panel.component';

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

	constructor(public store: Store<{}>, private router: Router) {}

	ngOnInit(): void {

		// get credential settings - anytime they change -> retrieve new profile
    	this.settings$ = this.store.pipe(
    		select(selectSettings),
    		distinctUntilChanged((prev, next) => prev.username === next.username && prev.password === next.password)
    	)
		.subscribe(() => this.store.dispatch(new ActionProfileRetrieve()));

    	this.profile$ = this.store.pipe(select(selectProfile)).subscribe(profile => this.profile = profile);
    }

	ngOnDestroy(): void {
		this.settings$.unsubscribe();
		this.profile$.unsubscribe();
	}
	
	logout(): void {
		this.store.dispatch(new ActionSettingsPersist({...initialState}));
		this.router.navigate(['/settings']);
	}

}