import { Component, AfterContentInit, ViewChild, ViewContainerRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from './../services/user.service';
import { DataService } from './../services/data.service';
import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';

import config from '../services/config';

declare var $ :any;

@Component({
	selector: 'app-nav-bar',
	templateUrl: './nav-bar.component.html',
	styleUrls: ['./nav-bar.component.scss']
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
		private toastr: ToastrService,
		public jira:JiraService,
		private modalService:NgbModal,
		private vcr: ViewContainerRef
	) { }

	/*
	*/
	ngAfterContentInit(): void {

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
	public searchTicket(): void {

		// make sure we have a value
		if(!this.ticketValue){
			this.toastr.showToast('MSRP or Jira key required to lookup a ticket', 'error');
			return;
		}

		// get ticket value and reset
		const ticketValue = this.ticketValue;
		this.ticketValue = '';

		// if NaN then is key and go to Jira else need key from MSRP
		if( isNaN(parseInt(ticketValue)) ){
			window.open(`${config.jiraUrl}/browse/${ticketValue}`);
			
		} else {
			this.jira.searchTicket(ticketValue)
			.subscribe( 
				data => window.open(`${config.jiraUrl}/browse/${data.data}`),
				error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
			);
		}
	}

	/*
	*/
	private resetUserSettings(content): void {

		this.modalService.open(content).result.then( confirm => {

			// if we logout delete user data then reload page
			if(confirm){
				this.user.resetUserData();
				window.location.reload();
			}
		});

	}

}
