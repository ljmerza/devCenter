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
	userProfile;
	userProfile$;

	teamdbEmberLinks;
	orders;
	atxOrders;
	wfaTickets;
	prodLinks;
	betaLinks;
	devLinks;
	emberLinks;
	rdsLinks;
	gpsLinks;

	navBarItems;
	navBarItems$;

	@ViewChild(ModalComponent) modal: ModalComponent;

	constructor(
		public config:ConfigService, public user: UserService, private cd: ChangeDetectorRef,
		private store:NgRedux<RootState>, private toastr: ToastrService, private items: ItemsService, 
		private git:GitService, private jira:JiraService
	) {}

	/**
	 * starts checker for Friday, gets navbar items, and watches for user profile in Redux.
	 */
	ngOnInit(){
		this.setFridayChecker();
		this.updateNavBar();

		if(!this.user.needRequiredCredentials()){

			this.git.getRepos().subscribe(
				repos => this.store.dispatch({type: Actions.repos, payload: repos.data}),
				this.git.processErrorResponse.bind(this.git)
			);

			this.jira.getActiveStrints().subscribe(
				sprint => this.store.dispatch({type: Actions.activeSprints, payload: sprint.data}),
				this.jira.processErrorResponse.bind(this.jira)
			);
		}
	}

	updateNavBar(){
		this.getNavbarItems();
		this.getUserProfile();
	}

	/**
	 * destroys any left overt subscriptions.
	 */
	ngOnDestroy(){
		if(this.userProfile$) this.userProfile$.unsubscribe();
	}

	/**
	 * Gets a user's Jira profile
	 */
	getUserProfile(){
		this.userProfile$ = this.store.select('userProfile')
		.subscribe((profile:any) => {
			this.userProfile = profile;
			this.cd.markForCheck();
		});
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
				this.cd.detectChanges();
			}
		}, 60*1000);
	}

	/**
	 * Gets all of the navbar items to populate the navbar dropdowns.
	 */
	 getNavbarItems(){
	 	this.items.getItems().subscribe(
	 		items => this.store.dispatch({type: Actions.navBarItems, payload: items.data}),
			this.jira.processErrorResponse.bind(this.jira)
		);

	 	this.navBarItems$ = this.store.select('navBarItems')
		.subscribe((navBarItems:any) => {
			this.navBarItems = navBarItems;
			this.cd.markForCheck();
		});
	}

	get emberUrlBase(){
		if(this.user.emberLocal){
			return `${this.user.emberUrlBase}:${this.user.emberPort}/UD-ember/${this.user.emberLocal}`;
		} else {
			return `${this.user.emberUrlBase}:${this.user.emberPort}/UD-ember`;
		}
	}

	get teamEmberUrlBase(){
		if(this.user.emberLocal){
			return `${this.user.teamUrlBase}:${this.user.teamPort}/teamdb/${this.user.teamLocal}`;
		} else {
			return `${this.user.teamUrlBase}:${this.user.teamPort}/teamdb`;
		}
	}

	get devUrlBase(){
		return `${this.user.devServerUrl}:${this.user.port}`;
	}
}