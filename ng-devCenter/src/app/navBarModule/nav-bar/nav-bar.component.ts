import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgRedux } from '@angular-redux/store';

import { NavbarModalComponent } from '../navbar-modal/navbar-modal.component';
import { LogoutComponent } from '../logout/logout.component';
import { ModalComponent } from '@modal';

import { Actions, RootState } from '@store';
import { APIResponse } from '@models';
import { UserService, ConfigService, ToastrService, ItemsService, GitService, JiraService } from '@services';

@Component({
	selector: 'dc-nav-bar',
	templateUrl: './nav-bar.component.html',
	styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
	showLogHours:boolean = false;

	navBarItems;
	navBarItems$;
	jqlNavbar;
	jqlNavbar$;

	@ViewChild(ModalComponent) modal: ModalComponent;

	constructor(
		public config:ConfigService, public user: UserService, private store:NgRedux<RootState>, 
		private git:GitService, private jira:JiraService
	) {}

	/**
	 * starts checker for Friday, gets navbar items, and watches for user profile in Redux.
	 */
	ngOnInit(){
		this.setFridayChecker();
		this.getNavbarItems();
		this.getJqls();

		if(!this.user.needRequiredCredentials()){
			this.git.getRepos();
			this.jira.getActiveSprints();
		}
	}

	/**
	 * destroys any left over subscriptions.
	 */
	ngOnDestroy(){
		if(this.navBarItems$) this.navBarItems$.unsubscribe();
		if(this.jqlNavbar$) this.jqlNavbar$.unsubscribe();
	}

	/**
	 * checks if it's Friday every minute to show log hours
	 */
	setFridayChecker(){
		const isFriday = () => (new Date()).getDay() == 5;
		this.showLogHours = isFriday();

		setInterval(() => {
			const itIsFriday = isFriday();

			if((itIsFriday && !this.showLogHours) || (!itIsFriday && this.showLogHours)) {
				this.showLogHours = itIsFriday;
			}
		}, 60*1000);
	}

	getNavbarItems(){
	 	this.navBarItems$ = this.store.select('navBarItems')
		.subscribe(navBarItems => this.navBarItems = navBarItems);
	}

	 getJqls(){
	 	this.jqlNavbar$ = this.store.select('jqlNavbar')
		.subscribe(jqlNavbar => this.jqlNavbar = jqlNavbar);
	}

	get emberUrlBase(){
		let baseUrl = `${this.user.emberUrlBase}:${this.user.emberPort}/UD-ember`;
		if(this.user.emberLocal) baseUrl += `/${this.user.emberLocal}`;
		return baseUrl;
	}

	get teamEmberUrlBase(){
		let baseUrl = `${this.user.teamUrlBase}:${this.user.teamPort}/UD-ember`;
		if(this.user.emberLocal) baseUrl += `/${this.user.teamLocal}`;
		return baseUrl;
	}

	get devUrlBase(){
		return `${this.user.devServerUrl}:${this.user.port}`;
	}
}