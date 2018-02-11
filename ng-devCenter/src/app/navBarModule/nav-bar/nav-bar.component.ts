import { Component } from '@angular/core';

import { NavbarModalComponent } from '../navbar-modal/navbar-modal.component';
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';
import { ConfigService } from '../../shared/services/config.service';
import { UserService } from '../../shared/services/user.service';

import { LogoutComponent } from '../logout/logout.component';
import { NgForm } from '@angular/forms';

declare var $ :any;

@Component({
	selector: 'dc-nav-bar',
	templateUrl: './nav-bar.component.html',
	styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
	ticketValue:string; // value of MSRP/key search
	isFriday:boolean; // boolean is Friday for log hours notification
	navbaritems;

	constructor(private toastr: ToastrService, public jira:JiraService, public config:ConfigService, public user: UserService) { 

		// is it current friday?
		const isFriday = () => (new Date()).getDay() == 5;
		this.isFriday = isFriday();

		// check every hour
		setInterval(isFriday, 60*60*1);

		this.getNavbarItems();
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
	 	.subscribe((response:any) => this.navbaritems = response.data)
	 }
}
