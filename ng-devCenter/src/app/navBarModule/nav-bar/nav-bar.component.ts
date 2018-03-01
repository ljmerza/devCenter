import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgRedux } from '@angular-redux/store';

import { NavbarModalComponent } from '../navbar-modal/navbar-modal.component';
import { LogoutComponent } from '../logout/logout.component';

import { Actions, RootState } from '@store';
import { APIResponse } from '@models';
import { UserService, ConfigService, ToastrService, JiraService } from '@services';

declare var $ :any;

@Component({
	selector: 'dc-nav-bar',
	templateUrl: './nav-bar.component.html',
	styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
	inputValue:string; // value of MSRP/key search
	buttonValue: string;
	placeHolderValue: string;

	validFormValues:Array<any> = [
		{
			value: 'jira', // used to select which method to call
			name: 'Search', // search button text
			placeholder: 'Search Jira Ticket' // input placeholder text
		},
		{
			value: 'order',
			name: 'Open Order',
			placeholder: 'Open Order'
		}		
	];

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

		// set default search values
		this.buttonValue = this.validFormValues[0].name;
		this.placeHolderValue = this.validFormValues[0].placeholder;

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
	public searchTicket(orderValue):void {
		if(!orderValue){
			this.toastr.showToast('MSRP or Jira key required to lookup a ticket', 'error');
			return;
		}

		// if NaN then is key and go to Jira else need key from MSRP
		if( isNaN(parseInt(orderValue)) ){
			window.open(`${this.config.jiraUrl}/browse/${orderValue}`);
		} else {
			this.jira.searchTicket(orderValue)
			.subscribe(
				data => window.open(`${this.config.jiraUrl}/browse/${data.data}`),
				error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
			);
		}
	}


	/**
	 * Opens an order in dev Ember.
	 * @param {NgForm} formObj
	 */
	public openOrder(orderValue):void {
		if(!orderValue){
			this.toastr.showToast('Order number required to open an order.', 'error');
			return;
		}

		window.open(`${this.user.emberUrl}:${this.user.emberPort}/UD-ember/${this.user.emberLocal}/ethernet/order/${orderValue}`);
	}

	/**
	 * Processes the navbar input form.
	 * @param {NgForm} formObj
	 */
	public submitInput(formObj: NgForm):void {
		const inputValue = formObj.value.inputValue;
		formObj.resetForm();

		const inputType = this.validFormValues.find(values => this.placeHolderValue === values.placeholder);
		switch(inputType.value){
			case 'order':
				this.openOrder(inputValue);
			case 'jira':
				this.searchTicket(inputValue);
			default:
				this.toastr.showToast('Invalid input type.', 'error');
		}
	}

	/**
	 * Changes the form input type.
	 * @param {string} inputType
	 */
	public changeInputType(inputType):void {
		const newInputType = this.validFormValues.find(values => inputType === values.placeholder);
		this.placeHolderValue = newInputType.placeholder;
		this.buttonValue = newInputType.name;
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