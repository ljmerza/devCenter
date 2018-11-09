import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { selectSettingsUsername, selectSettingsPassword, getMessage } from '@app/settings/settings.selectors';
import { selectProfile } from '@app/nav-bar/nav-bar.selectors';
import { ActionProfileRetrieve } from '@app/nav-bar/nav-bar.actions';

import { ActionSettingsPersist } from '@app/settings/settings.actions';
import { initialState } from '@app/settings/settings.reducer';

@Component({
	selector: 'dc-profile-dropdown',
	templateUrl: './profile-dropdown.component.html',
	styleUrls: ['./profile-dropdown.component.css'],
})
export class ProfileDropdownComponent implements OnInit {
	profile;
	private profile$: Subscription;
	private settings$: Subscription;

	constructor(public store: Store<{}>, private router: Router) {}

	ngOnInit(): void {

		// get credential settings - anytime they change -> retrieve new profile
    	this.settings$ = this.store.pipe(select(getMessage))
    		.subscribe(arg => {
    			console.log({arg});
    			this.store.dispatch(new ActionProfileRetrieve());
    	});

    	// this.settings$ = combineLatest(
    	// 	this.store.select(selectSettingsUsername), 
    	// 	this.store.select(selectSettingsPassword)
    	// )
    	// 	.subscribe(([username, password]) => {
    	// 		console.log({username, password});
    	// 		if(username && password) this.store.dispatch(new ActionProfileRetrieve());
    	// });

    	this.profile$ = this.store.pipe(select(selectProfile))
    		.subscribe(profile => this.profile = profile);
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