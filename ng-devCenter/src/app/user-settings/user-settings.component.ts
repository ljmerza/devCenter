import { Component, AfterContentInit, ViewChild } from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { UserService } from './../services/user.service'

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

	constructor(private modalService: NgbModal, private user: UserService) {
		this.username = user.username
		this.password = user.password
		this.port = user.port
		this.emberUrl = user.emberUrl
	}

	ngAfterContentInit() {
		if( this.user.requireCredentials() ){
			this.openUserSettings();
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
