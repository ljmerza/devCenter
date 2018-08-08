import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService, ToastrService, JiraService, ConfigService } from '@services';

@Component({
	selector: 'dc-searchbar',
	templateUrl: './searchbar.component.html',
	styleUrls: ['./searchbar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarComponent implements OnInit {
	inputValue: string;
	searchType;
	secondSearchType;

	validFormValues:Array<any> = [
		{
			value: 'Jira', // used to select which method to call
			name: 'Search', // search button text
			placeholder: 'Search Jira Ticket', // input placeholder text
			caller: 'searchTicket' // method name to be called when searching
		},
		{
			value: 'ATX',
			name: 'Open ATX',
			placeholder: 'Open ATX',
			caller: 'openWorkitem',
			url: 'order/atx', // url piece to use in ember
			secondDropdown: [
				{name: 'USO', value: 'usoNumber'},
				{name: 'SR', value: 'svcRequestName'},
				{name: 'PON', value: 'ponNumber'},
				{name: 'Package Name', value: 'packageName'},
				{name: 'OCX Order Number', value: 'ocxOrderNumber'},
				{name: 'Circuit ID', value: 'attCircuitId'},
				{name: 'iCore PVC ID', value: 'PVCId'},
				{name: 'iCore Site ID', value: 'SiteId'},
			],
			secondValue: 'usoNumber'
		},
		{
			value: 'Order',
			name: 'Open Order',
			placeholder: 'Open Order',
			caller: 'openWorkitem',
			url: 'order/ethernet' // url piece to use in ember
		},
		{
			value: 'BMP',
			name: 'Open BMP',
			placeholder: 'Open BMP Ticket',
			caller: 'openWorkitem',
			url: 'ticket/bmp'
		},
		{
			value: 'Ticket',
			name: 'Open Ticket',
			placeholder: 'Open WFA Ticket',
			caller: 'openWorkitem',
			url: 'ticket/ethernet'
		},
		{
			value: 'RDS Package',
			name: 'Open RDS',
			placeholder: 'Open RDS Package',
			caller: 'openWorkitem',
			url: 'order/rds'
		}
	];

	constructor(public user: UserService, private toastr: ToastrService, public jira:JiraService, public config:ConfigService) { }

	/**
	 * starts checker for Friday, gets navbar items, and watches for user profile in Redux.
	 */
	ngOnInit(){
		// set default search values
		this.searchType = this.validFormValues[0];
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
				error => this.jira.processErrorResponse(error)
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

		if(this.searchType.secondDropdown && !this.searchType.secondValue){
			this.toastr.showToast(`Secondary value required for ${workType}.`, 'error');
			return;
		} else if(this.searchType.secondDropdown){
			workType = `${workType}/${this.searchType.secondValue}`;
		}

		const urlPath = this.addCacheParameter({
			link: `/UD-ember/${this.user.emberLocal}${workType}/${workNumber}`
		}).link;

		window.open(`${this.user.emberUrlBase}:${this.user.emberPort}${urlPath}`);
	}

	/**
	 * Processes the navbar input form.
	 * @param {NgForm} formObj
	 */
	public submitInput(formObj: NgForm):void {
		const inputValue = (formObj.value.inputValue || '').trim();
		formObj.resetForm();

		this[this.searchType.caller](inputValue, this.searchType.url);
	}

	/**
	 * Changes the form input type.
	 * @param {string} inputType
	 */
	public changeInputType(inputType):void {
		this.searchType = this.validFormValues.find(values => inputType === values.placeholder);
	}

	/**
	 * Changes the form input secondary type.
	 * @param {string} inputType
	 */
	public changeSecondInputType(value):void {
		const chosenValue = this.searchType.secondDropdown.find(values => value === values.name);
		this.searchType.secondValue = chosenValue.value;
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
