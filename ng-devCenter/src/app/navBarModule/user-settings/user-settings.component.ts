import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';


import { UserService } from './../../shared/services/user.service'
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';

@Component({
	selector: 'dc-user-settings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
	userSettingsForm: FormGroup;
	@Input() isLogin:boolean = true;

	constructor(
		public user: UserService, private jira: JiraService, 
		private toastr: ToastrService, public route: ActivatedRoute,
		private router: Router
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
			cache: new FormControl(user.cache),
			pings: new FormGroup({
				allPing: new FormControl(),
				newPing: new FormControl(),
				conflictPing: new FormControl(),
				crFailPing: new FormControl(),
				mergePing: new FormControl(),
				neverPing: new FormControl(),
				qaFailPing: new FormControl(),
				uctFailPing: new FormControl()
			})
		});
	}

	/*
	*/
	ngOnInit() {

		console.log('this.router', this.router, this.route)
		// get route url
		this.route.url.subscribe( (urlSegment:UrlSegment[]) => {

			console.log('urlSegment', urlSegment[0].path)

			const hasCreds = !this.user.needRequiredCredentials();

			// if we are in logiun path and dont needs creds redirect
			if(hasCreds && urlSegment.length > 0 && urlSegment[0].path === 'login'){
				
				// if saved URL use to that else redirect to home
				if(this.user.redirectUrl) {
					this.router.navigate([this.user.redirectUrl]);
				} else {
					this.router.navigate(['/']);
				}
			}
			
			// if we have creds then try to get profile data
			if(hasCreds){
				this.jira.getProfile().subscribe(
					response => {
						if(response && response.data){
							this.user.userData = response.data;
							this.user.userPicture = response.data.avatarUrls['48x48'];

							this.setUserPings(this.user.userData.ping_settings)
						}
					},
					error => this.toastr.showToast(`Could not retrieve user profile: ${error}`,'error')
				)
			}
		});
	}

	/**
	*/
	setUserPings(pingSettings){
		let pingControlGroup = this.pings;

		// set form group ping settings from what we got back from the DB
		pingControlGroup.get('allPing').setValue(new FormControl(pingSettings.all_ping));
		pingControlGroup.get('newPing').setValue(new FormControl(pingSettings.new_ping));
		pingControlGroup.get('conflictPing').setValue(new FormControl(pingSettings.conflict_ping));
		pingControlGroup.get('crFailPing').setValue(new FormControl(pingSettings.cr_fail_ping));
		pingControlGroup.get('mergePing').setValue(new FormControl(pingSettings.merge_ping));
		pingControlGroup.get('neverPing').setValue(new FormControl(pingSettings.never_ping));
		pingControlGroup.get('qaFailPing').setValue(new FormControl(pingSettings.qa_fail_ping));
		pingControlGroup.get('uctFailPing').setValue(new FormControl(pingSettings.uct_fail_ping));
		pingControlGroup.markAsPristine();
	}

	/*
	*/
	resetForm(){
		this.userSettingsForm.reset({
			username: this.user.username,
			password: this.user.password,
			port: this.user.port,
			emberUrl: this.user.emberUrl,
			teamUrl: this.user.teamUrl,
			cache: this.user.cache
		});

		// reset user ping settings if they exist
		if(this.user.userData) this.setUserPings(this.user.userData.ping_settings);
	}

	/*
	*/
	get username(){ return this.userSettingsForm.get('username'); }
	get password(){ return this.userSettingsForm.get('password'); }
	get port(){ return this.userSettingsForm.get('port'); }
	get emberUrl(){ return this.userSettingsForm.get('emberUrl'); }
	get teamUrl(){ return this.userSettingsForm.get('teamUrl'); }
	get cache(){ return this.userSettingsForm.get('cache'); }
	get pings() { return this.userSettingsForm.get('pings'); }

	/*
	*/
	submit(submitType){

		// just close form if no submit type
		if(!submitType){
			this.resetForm();
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

		if(!this.pings.pristine){
			this.savePingSettings();
		} else {
			this.toastr.showToast('Saved User Settings', 'success');
			this.reloadPage();
		}
	}

	/**
	*/
 	reloadPage(){

 		// reload values saved into form
 		this.resetForm();

 		const controls = this.userSettingsForm.controls;
 		// if we were given a redirect URL then redirect to that
 		if(this.user.redirectUrl){
 			// save and reset redirect URL
 			const url = this.user.redirectUrl;
 			this.user.redirectUrl = '';

 			// redirect to URL
 			this.router.navigate([url]);
 			return;
 		}

 		// is username or password is dirty we need to reload on modal
 		if((controls.username.dirty || controls.password.dirty) && !this.isLogin){
			location.reload();

		} else if(controls.username.dirty || controls.password.dirty){
			// if username/password dirty then redirect
			this.router.navigate(['/']);
		}
 	}

 	/**
 	*/
 	savePingSettings(){
 		let pingControlGroup = this.pings;

 		let postData = {
 			fields: [
 				{name:'all_ping', value:pingControlGroup.get('allPing').value ? 1 : 0}
 			]
 		}

 		this.jira.setPingSettings(postData).subscribe(
 			response => {
 				this.toastr.showToast('Saved User Settings', 'success');
 				this.reloadPage();
 			},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
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
