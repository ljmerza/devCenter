import { Component, AfterContentInit, ViewChild } from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { UserService } from './../services/user.service'
import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';

@Component({
	selector: 'app-user-settings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements AfterContentInit {
	username;
	password;
	port;
	emberUrl;

	@ViewChild('content') private content;

	constructor(
		private modalService: NgbModal, 
		private user: UserService, 
		private jira: JiraService, 
		private toastr: ToastrService
	) {
		this.username = user.username
		this.password = user.password
		this.port = user.port
		this.emberUrl = user.emberUrl
	}

	ngAfterContentInit() {
		if( this.user.requireCredentials() ){
			this.openUserSettings();
		} else {
			this.jira.getProfile().subscribe(
				response => {
					this.user.userData = response.data;
					this.user.userPicture = response.data.avatarUrls['24x24'];
			},
				error => this.toastr.showToast(`Could not retrieve user profile ${error}`,'error')
			)
		}
	}

	openUserSettings() {
		this.username = this.user.username
		this.password = this.user.password
		this.port = this.user.port
		this.emberUrl = this.user.emberUrl

		this.modalService.open(this.content, {keyboard:false,backdrop:false}).result.then((result) => {
			// if save action then save new data
			if(result === 'save'){
				this.user.setUserData('username', this.username);
				this.user.setUserData('password', this.password);
				this.user.setUserData('port', this.port);
				this.user.setUserData('emberUrl', this.emberUrl);

				// refresh window
				location.reload();
			}
		});
	}

}
