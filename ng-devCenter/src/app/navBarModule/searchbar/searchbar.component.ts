import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService, ToastrService, JiraService, ConfigService } from '@services';

@Component({
	selector: 'dc-searchbar',
	templateUrl: './searchbar.component.html',
	styleUrls: ['./searchbar.component.scss']
})
export class SearchbarComponent implements OnInit {
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
			url: 'ethernet/order' // url piece to use in ember
		},
		{
			value: 'Ticket',
			name: 'Open Ticket',
			placeholder: 'Open WFA Ticket',
			caller: 'openWorkitem',
			url: 'ethernet/ticket'
		},
		{
			value: 'RDS Package',
			name: 'Open RDS',
			placeholder: 'Open RDS Package',
			caller: 'openWorkitem',
			url: 'order/rds'
		}
	];

	placeHolderValue:string = '';
	buttonValue:string = '';

	constructor(public user: UserService, private toastr: ToastrService, public jira:JiraService, public config:ConfigService) { }

	/**
	 * starts checker for Friday, gets navbar items, and watches for user profile in Redux.
	 */
	ngOnInit(){
		// set default search values
		this.buttonValue = this.validFormValues[0].name;
		this.placeHolderValue = this.validFormValues[0].placeholder;
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
			link: `/UD-ember/${this.user.emberLocal}${workType}/${workNumber}`
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
	 * adds cache query parameter to URLs
	 * @param {Object} navbarItem
	 */
	addCacheParameter(navbarItem){
		const queryAddition = navbarItem.link.includes('?') ? '&' : '?';
		navbarItem.link += `${queryAddition}cache=${this.user.cache}`;
		return navbarItem;
	}

}
