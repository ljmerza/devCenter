import { Component, AfterContentInit } from '@angular/core';
declare var $ :any;

@Component({
	selector: 'app-nav-bar',
	templateUrl: './nav-bar.component.html',
	styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements AfterContentInit {

	constructor() { }

	ticketValue:string = '';

	ngAfterContentInit() {

		// add mouse events to show/hide submenus
		$('.dropdown-submenu').on('mouseenter mouseleave','.dropdown',function(e){
			const $elem = $(e.target).closest('.dropdown');
			$elem.addClass('show');
			
			// after 300 ms then toggle class
			setTimeout(function(){
				$elem[$elem.is(':hover')?'addClass':'removeClass']('show');
			},300);
		});
	}

	attuid:string = 'lm240n';
	port:number = 8173;

	devUrl = 'http://m5devacoe01.gcsc.att.com';
	betaUrl = 'http://chrapud16b.gcsc.att.com';
	jiraUrl = 'https://jira.web.att.com:8443';
	crucibleUrl = 'https://icode3.web.att.com';
	codeCloudUrl = 'https://codecloud.web.att.com';
	emberLocal = '#/';
	emberUrl = `http://m5devacoe01.gcsc.att.com${this.port}`;
	wikiUrl = 'https://wiki.web.att.com';

	

	missingUserSettings() {
		return true;
	}

	searchTicket() {

		// get search value and reset it
		const ticketValue = this.ticketValue;
		this.ticketValue = '';

		// if NaN then is key and go to jira else need key fro msrp
		if( isNaN(parseInt(ticketValue)) ){
			window.open(`${this.jiraUrl}/browse/${ticketValue}`);
		} else {
			$.ajax({
				type: 'GET',
				url: `http://m5devacoe01.gcsc.att.com:5858/devCenter/jira/get_key/${ticketValue}`
			})
			.then( data => {
				if(data.key){
					window.open(`${this.jiraUrl}/browse/${data.key}`);
				}
			})
		}
	}

}
