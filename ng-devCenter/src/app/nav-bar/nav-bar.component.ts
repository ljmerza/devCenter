import { Component, AfterContentInit, ViewChild } from '@angular/core';
import { UserService } from './../services/user.service'
import { DataService } from './../services/data.service'
import { JiraService } from './../services/jira.service'

declare var $ :any;

@Component({
	selector: 'app-nav-bar',
	templateUrl: './nav-bar.component.html',
	styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements AfterContentInit {

	ticketValue:string;
	@ViewChild('userSetting') private userSetting;

	/*
	*/
	constructor(private user: UserService, private data:DataService, private jira:JiraService) { }

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
			window.open(`${this.data.jiraUrl}/browse/${this.ticketValue}`);
			this.ticketValue = '';
			
		} else {
			this.jira.searchTicket(this.ticketValue)
			.subscribe( data => {
				if(data.key){
					window.open(`${this.data.jiraUrl}/browse/${data.key}`);
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
