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
	teamUrl;

	cache;

	@ViewChild('content') private content;

	constructor(
		private modalService: NgbModal, 
		private user: UserService, 
		private jira: JiraService, 
		private toastr: ToastrService
	) {
		this._sync_settings();
	}

	ngAfterContentInit() {
		if( this.user.requireCredentials() ){
			this.openUserSettings();
		} else {
			this.jira.getProfile().subscribe(
				response => {
					this.user.userData = response.data;
					this.user.userPicture = response.data.avatarUrls['48x48'];
			},
				error => this.toastr.showToast(`Could not retrieve user profile ${error}`,'error')
			)
		}
	}

	openUserSettings() {
		this._sync_settings();

		this.modalService.open(this.content, {keyboard:false,backdrop:false}).result.then((result) => {

			// if save action then save new data
			if(result === 'save'){

				let sync = false;
				// if changing username or password then refresh
				if(this.username != this.user.username || this.password != this.user.password) {
					sync = true;
				}

				this.user.setUserData('username', this.username);
				this.user.setUserData('password', this.password);
				this.user.setUserData('port', this.port);
				this.user.setUserData('emberUrl', this.emberUrl);
				this.user.setUserData('teamUrl', this.teamUrl);
				this.user.setUserData('cache', this.cache);

				// if we need a sync then reload page now
				if(sync){
					location.reload();
				}

			}
		});
	}

	_sync_settings(){
		this.username = this.user.username;
		this.password = this.user.password;
		this.port = this.user.port;
		this.emberUrl = this.user.emberUrl;
		this.teamUrl = this.user.teamUrl;
		this.cache = this.user.cache;
	}

}
