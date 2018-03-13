import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgRedux } from '@angular-redux/store';

import { NavbarModalComponent } from '../navbar-modal/navbar-modal.component';
import { LogoutComponent } from '../logout/logout.component';
import { ModalComponent } from '@modal';

import { Actions, RootState } from '@store';
import { APIResponse } from '@models';
import { UserService, ConfigService, ToastrService } from '@services';

@Component({
	selector: 'dc-nav-bar',
	templateUrl: './nav-bar.component.html',
	styleUrls: ['./nav-bar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent implements OnInit, OnDestroy {

	isFriday:boolean; // boolean is Friday for log hours notification
	userProfile;
	userProfile$;

	teamdbEmberLinks;
	otherOrders;
	orders;
	wfaTickets;
	prodLinks;
	betaLinks;
	devLinks;
	emberLinks;

	@ViewChild(ModalComponent) modal: ModalComponent;

	constructor(
		public config:ConfigService, public user: UserService, private cd: ChangeDetectorRef,
		private store:NgRedux<RootState>, private toastr: ToastrService
	) {}

	/**
	 * starts checker for Friday, gets navbar items, and watches for user profile in Redux.
	 */
	ngOnInit(){
		this.setFridayChecker();
		this.getNavbarItems();

		this.userProfile$ = this.store.select('userProfile').subscribe((profile:any) => {
			this.userProfile = profile;
			this.cd.detectChanges();
		});
	}

	/**
	 * destroys any left overt subscriptions.
	 */
	ngOnDestroy(){
		if(this.userProfile$) this.userProfile$.unscubscribe();
	}

	/**
	 * checks if it's Friday every hour to show log hours
	 */
	setFridayChecker(){
		const isFriday = () => (new Date()).getDay() == 5;
		this.isFriday = isFriday();
		setInterval(() => {
			if( isFriday() ) {
				this.cd.detectChanges();
			}
		}, 60*60*1);
	}

	/**
	 * Gets all of the navbar items to populate the navbar dropdowns.
	 */
	 getNavbarItems(){
	 	this.user.getNavbarItems()
	 	.subscribe((response:any) => {

	 		if(!response.data) return;

	 		this.orders = response.data
	 		.filter(link => link.type === 'order')
	 		.map(this.addCacheParameter.bind(this))
	 		.map(this.addUserNameToUrl.bind(this));

	 		this.otherOrders = response.data
	 		.filter(link => link.type === 'other_order')
	 		.map(this.addCacheParameter.bind(this))
	 		.map(this.addUserNameToUrl.bind(this));

	 		this.wfaTickets = response.data
	 		.filter(link => link.type === 'wfa')
	 		.map(this.addCacheParameter.bind(this))
	 		.map(this.addUserNameToUrl.bind(this));

	 		this.betaLinks = response.data
	 		.filter(link => link.type === 'beta_links')
	 		.map(this.addUserNameToUrl.bind(this))
 			.map(link => {
 				if( !/^http/.test(link.link) ) link.link = `${this.config.betaUrl}/${link.link}`;
 				return link;
 			});

	 		this.prodLinks = response.data
	 		.filter(link => link.type === 'prod_links')
	 		.map(this.addUserNameToUrl.bind(this));

 			this.devLinks = response.data
 			.filter(link => link.type === 'dev_links')
 			.map(this.addUserNameToUrl.bind(this))
 			.map(link => {
 				if( !/^http/.test(link.link) ) link.link = `${this.config.devUrl}:${this.user.port}/${link.link}`;
 				return link;
 			});

 			this.emberLinks = response.data
 			.filter(link => link.type === 'ember_links')
 			.map(this.addCacheParameter.bind(this))
 			.map(this.addUserNameToUrl.bind(this));

 			this.teamdbEmberLinks = response.data
 			.filter(link => link.type === 'teamdb_ember')
 			.map(this.addCacheParameter.bind(this))
 			.map(this.addUserNameToUrl.bind(this));

	 	},
	 	error => this.toastr.showToast(this.user.processErrorResponse(error), 'error'));
	}

	/**
	 * adds username to any URLs that need it
	 * @param {Object} navbarItem
	 */
	addUserNameToUrl(navbarItem){
		navbarItem.link = navbarItem.link.replace('##username##', this.user.username);
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

	aboutModel;
	openAboutModal(){
		this.aboutModel = this.modal.openModal();
	}

	closeAboutModal(){
		this.aboutModel.close();
	}
}