import { Component, AfterContentInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from './../services/user.service';
import { DataService } from './../services/data.service';
import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';
import { ConfigService } from '../services/config.service';

import { LogoutComponent } from '../logout/logout.component';
import { NgForm } from '@angular/forms';

declare var $ :any;

@Component({
	selector: 'app-nav-bar',
	templateUrl: './nav-bar.component.html',
	styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements AfterContentInit {
	ticketValue:string;
	isFriday:boolean;

	@ViewChild('userSetting') private userSetting;
	@ViewChild(LogoutComponent) private logout: LogoutComponent;


	/*
	*/
	constructor(
		public user: UserService, 
		public data:DataService,  
		private toastr: ToastrService,
		public jira:JiraService,
		private modalService:NgbModal,
		public config:ConfigService
	) { 

		this.isFriday = (new Date()).getDay() == 6;

		// check every two hours
		setTimeout( () => {
			this.isFriday = (new Date()).getDay() == 6;
		}, 60*60*2)
		
	}

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

	/*
	*/
	resetUserSettings(){
		this.logout.resetUserSettings();
	}

}
