import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgRedux } from '@angular-redux/store';

import { NavbarModalComponent } from '../navbar-modal/navbar-modal.component';
import { LogoutComponent } from '../logout/logout.component';
import { ModalComponent } from '@modal';

import { Actions, RootState } from '@store';
import { APIResponse } from '@models';
import { UserService, ConfigService, ToastrService, ItemsService } from '@services';

@Component({
	selector: 'dc-nav-bar',
	templateUrl: './nav-bar.component.html',
	styleUrls: ['./nav-bar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
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

	@ViewChild(ModalComponent) modal: ModalComponent;

	constructor(
		public config:ConfigService, public user: UserService, private cd: ChangeDetectorRef,
		private store:NgRedux<RootState>, private toastr: ToastrService, private items: ItemsService
	) {}

	/**
	 * starts checker for Friday, gets navbar items, and watches for user profile in Redux.
	 */
	ngOnInit(){
		this.setFridayChecker();

		if(!this.user.needRequiredCredentials()){
			this.updateNavBar();
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
	 	this.items.getItems()
	 	.subscribe((response:any) => {

	 		if(!response.data) return;

	 		this.orders = response.data
	 		.filter(link => link.type === 'order')
	 		.map(this.addCacheParameter.bind(this))
	 		.sort(this.sortByName.bind(this));

	 		this.atxOrders = response.data
	 		.filter(link => link.type === 'atx')
	 		.map(this.addCacheParameter.bind(this))
	 		.sort(this.sortByName.bind(this));

	 		this.wfaTickets = response.data
	 		.filter(link => link.type === 'wfa')
	 		.map(this.addCacheParameter.bind(this))
	 		.map(this.addUserNameToUrl.bind(this))
	 		.sort(this.sortByName.bind(this));

	 		this.betaLinks = response.data
	 		.filter(link => link.type === 'beta_links')
	 		.map(this.addUserNameToUrl.bind(this))
 			.map(link => {
 				if( !/^http/.test(link.link) ) link.link = `${this.config.betaUrl}/${link.link}`;
 				return link;
 			})
 			.sort(this.sortByName.bind(this));

	 		this.prodLinks = response.data
	 		.filter(link => link.type === 'prod_links')
	 		.map(this.addUserNameToUrl.bind(this))
	 		.sort(this.sortByName.bind(this));

 			this.devLinks = response.data
 			.filter(link => link.type === 'dev_links')
 			.map(this.addUserNameToUrl.bind(this))
 			.sort(this.sortByName.bind(this));

 			this.emberLinks = response.data
 			.filter(link => link.type === 'ember_links')
 			.map(link => {
 				link.orderName = link.link;
 				return link;
 			})
 			.map(this.addCacheParameter.bind(this))
 			.map(this.addUserNameToUrl.bind(this))
 			.sort(this.sortByName.bind(this));

 			this.teamdbEmberLinks = response.data
 			.filter(link => link.type === 'teamdb_ember')
 			.map(this.addCacheParameter.bind(this))
			.map(this.addUserNameToUrl.bind(this))
			.sort(this.sortByName.bind(this));
			 
			this.rdsLinks = response.data
 			.filter(link => link.type === 'rds')
 			.map(this.addCacheParameter.bind(this))
 			.sort(this.sortByName.bind(this));
			 
			this.gpsLinks = response.data
 			.filter(link => link.type === 'gps')
 			.map(this.addCacheParameter.bind(this))
 			.map(this.addGpsIdToUrl.bind(this))
 			.sort(this.sortByName.bind(this));

	 	},
	 	error => this.toastr.showToast(this.items.processErrorResponse(error), 'error'));
	}

	/**
	 * adds username to any URLs that need it
	 * @param {Object} navbarItem
	 */
	addUserNameToUrl(navbarItem, alwaysAddUsername){
		navbarItem.link = navbarItem.link.replace('##username##', this.user.username);
 		return navbarItem;
	}

	/**
	 * adds GPS username to any URLs that need it
	 * @param {Object} navbarItem
	 */
	addGpsIdToUrl(navbarItem){
		const queryAddition = navbarItem.link.includes('?') ? '&' : '?';
		navbarItem.link += `${queryAddition}gpsid=${this.user.username}`;
		return navbarItem;
	}

	/**
	 * adds cache query parameter to URLs
	 * @param {Object} navbarItem
	 */
	addCacheParameter(navbarItem){
		const queryAddition = navbarItem.link.includes('?') ? '&' : '?';
		navbarItem.link += `${queryAddition}cache=${this.user.cache}`;
		return navbarItem;
	}

	sortByName(a, b){
		if(a.name > b.name) return 1;
		else if(a.name < b.name) return -1;
		else return 0;
	}
}