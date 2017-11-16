import { Component, AfterContentInit, ViewChild, ViewContainerRef } from '@angular/core';
import { UserService } from './../services/user.service';
import { DataService } from './../services/data.service';
import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';

import config from '../services/config';

declare var $ :any;

@Component({
	selector: 'app-nav-bar',
	templateUrl: './nav-bar.component.html',
	styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements AfterContentInit {
	config=config

	ticketValue:string;
	@ViewChild('userSetting') private userSetting;

	/*
	*/
	constructor(
		public user: UserService, 
		public data:DataService,  
		private jira:JiraService,
		public toastr: ToastrService, 
		vcr: ViewContainerRef
	) { }

	/*
	*/
	ngAfterContentInit() {

		// add mouse events to show/hide submenus
		$('.dropdown-submenu').on('mouseenter mouseleave','.dropdown', function(e){
			const $elem = $(e.target).closest('.dropdown');
			$elem.addClass('show');
			
			// after 300 ms then toggle class
			setTimeout(function(){
				$elem[$elem.is(':hover')?'addClass':'removeClass']('show');
			},300);
		});
	}


	/*
	*/
	searchTicket() {
		// if NaN then is key and go to Jira else need key from MSRP
		if( isNaN(parseInt(this.ticketValue)) ){
			window.open(`${config.jiraUrl}/browse/${this.ticketValue}`);
			this.ticketValue = '';
			
		} else {
			this.jira.searchTicket(this.ticketValue)
			.subscribe( data => {
				if(data.status){
					window.open(`${config.jiraUrl}/browse/${data.data}`);
				} else {
					this.toastr.showToast(`Could not find Jira ticket ticket with given MSRP: ${this.ticketValue}`, 'error');
				}
				this.ticketValue = '';
			})
		}
	}

	/*
	*/
	openUserSettings(){
		this.userSetting.openUserSettings();
	}

}
