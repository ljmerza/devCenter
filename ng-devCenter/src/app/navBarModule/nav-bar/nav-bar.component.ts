import { Component, OnInit, OnDestroy } from '@angular/core';

import { NavbarModalComponent } from '../navbar-modal/navbar-modal.component';
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';
import { ConfigService } from '../../shared/services/config.service';
import { UserService } from '../../shared/services/user.service';

import { LogoutComponent } from '../logout/logout.component';
import { NgForm } from '@angular/forms';

import { NgRedux } from '@angular-redux/store';
import { RootState } from './../../shared/store/store';
import { Actions } from './../../shared/store/actions';

import { APIResponse } from './../../shared/store/models/apiResponse';

declare var $ :any;

@Component({
	selector: 'dc-nav-bar',
	templateUrl: './nav-bar.component.html',
	styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
	ticketValue:string; // value of MSRP/key search
	isFriday:boolean; // boolean is Friday for log hours notification
	userProfile;
	userProfile$;

	otherOrders;
	orders;
	wfaTickets;
	prodLinks;
	betaLinks;
	devLinks;
	emberLinks;

	constructor(
		private toastr: ToastrService, public jira:JiraService, public config:ConfigService, 
		public user: UserService, private store:NgRedux<RootState>
	) {}

	/**
	 * starts checker for Friday, gets navbar items, and watches for user profile in Redux.
	 */
	ngOnInit(){
		this.setFridayChecker();
		this.getNavbarItems();

		this.userProfile$ = this.store.select('userProfile').subscribe(profile => {
			if(profile) this.userProfile = profile;
		});
	}

	/**
	 * destorys any left overt subscriptions.
	 */
	ngOnDestroy(){
		if(this.userProfile$) this.userProfile$.unscubscribe();
	}

	/**
	 * checks if it's friday every hour to show log hours
	 */
	setFridayChecker(){
		const isFriday = () => (new Date()).getDay() == 5;
		this.isFriday = isFriday();
		setInterval(isFriday, 60*60*1);
	}

	/**
	 * Searches for a Jira ticket by key or MSRP. If ticket found opens in new tab.
	 * @param {NgForm} formObj
	 */
	public searchTicket(formObj: NgForm):void {

		// get form values and reset form
		const formData = formObj.value;
		formObj.resetForm();

		// make sure we have a value
		if(!formData.ticketValue){
			this.toastr.showToast('MSRP or Jira key required to lookup a ticket', 'error');
			return;
		}

		// if NaN then is key and go to Jira else need key from MSRP
		if( isNaN(parseInt(formData.ticketValue)) ){
			window.open(`${this.config.jiraUrl}/browse/${formData.ticketValue}`);
			
		} else {
			this.jira.searchTicket(formData.ticketValue)
			.subscribe(
				data => window.open(`${this.config.jiraUrl}/browse/${data.data}`),
				error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
			);
		}
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

	 	});
	}
	teamdbEmberLinks;

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
}