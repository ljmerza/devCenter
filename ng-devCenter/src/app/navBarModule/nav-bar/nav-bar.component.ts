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
			value: 'Jira', // used to select which method to call
			name: 'Search', // search button text
			placeholder: 'Search Jira Ticket', // input placeholder text
			caller: 'searchTicket' // method name to be called when searching
		},
		{
			value: 'Order',
			name: 'Open Order',
			placeholder: 'Open Order',
			caller: 'openWorkitem',
			url: 'order' // url piece to use in ember
		},
		{
			value: 'Ticket',
			name: 'Open Ticket',
			placeholder: 'Open WFA Ticket',
			caller: 'openWorkitem',
			url: 'ticket'
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

		this.userProfile$ = this.store.select('userProfile').subscribe((profile:any) => {
			this.userProfile = profile;
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
	 * @param {string} orderValue
	 */
	public searchTicket(orderValue, workType=''):void {
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
	 * Opens a workitem in dev Ember.
	 * @param {string} orderValue the workitem number
	 * @param {string} workType the type of workitem
	 */
	public openWorkitem(workNumber, workType):void {
		if(!workNumber){
			this.toastr.showToast(`${workType} number required.`, 'error');
			return;
		}

		const urlPath = this.addCacheParameter({
			link: `/UD-ember/${this.user.emberLocal}${workType}/ethernet/${workNumber}`
		}).link;

		window.open(`${this.user.emberUrl}:${this.user.emberPort}${urlPath}`);
	}

	/**
	 * Processes the navbar input form.
	 * @param {NgForm} formObj
	 */
	public submitInput(formObj: NgForm):void {
		const inputValue = (formObj.value.inputValue || '').trim();
		formObj.resetForm();

		const inputType = this.validFormValues.find(values => this.placeHolderValue === values.placeholder);
		const searchParameters = this.validFormValues.find(forms => forms.value === inputType.value);

		if(searchParameters){
			this[searchParameters.caller](inputValue, searchParameters.url);
		} else {
			return this.toastr.showToast('Invalid input type.', 'error');
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