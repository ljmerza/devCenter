import { Component, AfterContentInit, ViewChild } from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { UserService } from './../services/user.service'

@Component({
	selector: 'app-user-settings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements AfterContentInit {
	closeResult: string;
	username;
	password;
	port;
	emberUrl;
	emberBuilds;

	forcedSettings = false;

	@ViewChild('content') private content;

	constructor(private modalService: NgbModal, private user: UserService) {
		this.username = user.username;
		this.password = user.password;
		this.port = user.port;
		this.emberUrl = user.emberUrl;
		this.emberBuilds = user.emberBuilds;

	}

	ngAfterContentInit() {
		if(!this.username || !this.port || !this.emberUrl){
			this.openUserSettings();
			this.forcedSettings = true;
		}
	}

	openUserSettings() {
		this.modalService.open(this.content, {keyboard:false,backdrop:false}).result.then((result) => {

			if(result === 'save'){
				this.user.setUserData('username', this.username);
				this.user.setUserData('password', this.password);
				this.user.setUserData('port', this.port);
				this.user.setUserData('emberUrl', this.emberUrl);
			}
		});
	}

}
