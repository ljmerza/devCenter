import { Component, AfterContentInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from './../services/user.service'
import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';

@Component({
	selector: 'app-user-settings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements AfterContentInit {
	userSettingsForm: FormGroup;
	modelInstance: NgbModalRef;
	@ViewChild('userModal') private userModal;

	constructor(
		private modalService: NgbModal, private user: UserService, 
		private jira: JiraService, private toastr: ToastrService
	) {
		// create form group
		this.userSettingsForm = new FormGroup({
			username: new FormControl(user.username, Validators.compose(
				[Validators.required, UserSettingsComponent.usernameValidator]
			)),
			password: new FormControl(user.password, [Validators.required]),
			port: new FormControl(user.port, Validators.compose(
				[Validators.required, UserSettingsComponent.portValidator]
			)),
			emberUrl: new FormControl(user.emberUrl, [Validators.required]),
			teamUrl: new FormControl(user.teamUrl, [Validators.required]),
			cache: new FormControl(user.cache)
		});
	}

	/*
	*/
	ngAfterContentInit() {
		if( this.user.needRequiredCredentials() ){
			this.openUserSettings();
		} else {
			this.jira.getProfile().subscribe(
				response => {
					this.user.userData = response.data;
					this.user.userPicture = response.data.avatarUrls['48x48'];
			},
				error => this.toastr.showToast(`Could not retrieve user profile: ${error}`,'error')
			)
		}
	}

	/*
	*/
	get username(){ return this.userSettingsForm.get('username'); }
	get password(){ return this.userSettingsForm.get('password'); }
	get port(){ return this.userSettingsForm.get('port'); }
	get emberUrl(){ return this.userSettingsForm.get('emberUrl'); }
	get teamUrl(){ return this.userSettingsForm.get('teamUrl'); }
	get cache(){ return this.userSettingsForm.get('cache'); }

	/*
	*/
	submit(submitType){

		// just close form if no submit type
		if(!submitType){
			this.modelInstance.close();
			return;
		}

		// if form is invalid then do nothing
		if(this.userSettingsForm.invalid) return;

		// save data to localstorage
		this.user.setUserData('username', this.userSettingsForm.controls.username.value);
		this.user.setUserData('password', this.userSettingsForm.controls.password.value);
		this.user.setUserData('port', this.userSettingsForm.controls.port.value);
		this.user.setUserData('emberUrl', this.userSettingsForm.controls.emberUrl.value);
		this.user.setUserData('teamUrl', this.userSettingsForm.controls.teamUrl.value);
		this.user.setUserData('cache', this.userSettingsForm.controls.cache.value);

		// if we need a sync then reload page now
		if(
			this.userSettingsForm.controls.username.dirty
			|| this.userSettingsForm.controls.password.dirty
		){
			location.reload();
		}
	}

	/*
	*/
	openUserSettings() {
		this.modelInstance = this.modalService.open(this.userModal, {keyboard:false,backdrop:false});
	}

	/*
	*/
	static usernameValidator(control: AbstractControl): {[key: string]:any} {
		const invalidUsername = control.value && /^[A-Za-z]{2}[0-9]{3}[A-Za-z0-9]$/.test(control.value);
		return invalidUsername ? null : {usernameValidator: {value: control.value}} ;
	}

	/*
	*/
	static portValidator(control: AbstractControl): {[key: string]:any} {
		const validPort = control.value && /^[0-9]{4}$/.test(control.value);
		return validPort ? null : {portValidator: {value: control.value}} ;
	}
}
