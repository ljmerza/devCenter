import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { NgRedux } from '@angular-redux/store';

import { ProfileService, ToastrService, JiraPingsService, UserService } from '@services';
import { RootState, Actions } from '@store';

@Component({
	selector: 'dc-user-settings',
templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
	userSettingsForm: FormGroup;
	gotProfile = false;
	@Input() isLogin:boolean = true;
	@Output() userCredsChangedEvent = new EventEmitter();

	constructor(
		public user: UserService, private jira: JiraPingsService, private toastr: ToastrService, 
		public route: ActivatedRoute, private router: Router, private profile: ProfileService, public store:NgRedux<RootState>
	) { }

	/**
	 * builds the form object
	 */
	buildForm(){
		// create form group
		this.userSettingsForm = new FormGroup({
			username: new FormControl(this.user.username, Validators.compose(
				[Validators.required, UserSettingsComponent.usernameValidator]
			)),
			password: new FormControl(this.user.password, [Validators.required]),
			port: new FormControl(this.user.port, Validators.compose(
				[Validators.required, UserSettingsComponent.portValidator]
			)),
			devServer: new FormControl(this.user.devServer, [Validators.required]),
			emberUrl: new FormControl(this.user.emberUrl, [Validators.required]),
			teamUrl: new FormControl(this.user.teamUrl, [Validators.required]),
			cache: new FormControl(this.user.cache)
		});
	}

	/**
	 * Subscribe to URL route changes to see if user needs credentials,
	 * if yes then if login page then redirect else get user profile.
	 */
	ngOnInit() {
		this.buildForm();

		this.route.url.subscribe( (urlSegment:UrlSegment[]) => {
			if(this.user.needRequiredCredentials()) return;

			// if we are in login path -> redirect out of login page
			// if saved URL use to that else redirect to home
			if(urlSegment.length > 0 && /login/.test(urlSegment[0].path)){
				if(this.user.redirectUrl) return this.router.navigate([this.user.redirectUrl]);
				else return this.router.navigate(['/']);
			} 
			else this.getProfile();


		});
	}

	/**
	 * Gets a user's profile. Saved to Redux and user form is set.
	 */
	getProfile(){
		this.profile.getProfile().subscribe(
			profile => {
				if(!profile.data) return;
				if(!this.gotProfile) {
					this.gotProfile = true;
					this.store.dispatch({type: Actions.userProfile, payload: profile.data });
				}
			},
			error => {
				this.profile.processErrorResponse(error, `Incorrect username and/or password.`);
			}
		);
	}

	/**
	 * Resets the user form to default seetings. Checks for ping setting resets.
	 */
	resetForm(){
		this.userSettingsForm.reset({
			username: this.user.username,
			password: this.user.password,
			port: this.user.port,
			devServer: this.user.devServer,
			emberUrl: this.user.emberUrl,
			teamUrl: this.user.teamUrl,
			cache: this.user.cache
		});

		// reset user ping settings if they exist
		// if(this.user.userData) this.setUserPings(this.user.userData.ping_settings);
	}

	/**
	 * getters for ngform objects
	 */
	get username(){ return this.userSettingsForm.get('username'); }
	get password(){ return this.userSettingsForm.get('password'); }
	get port(){ return this.userSettingsForm.get('port'); }
	get devServer(){ return this.userSettingsForm.get('devServer'); }
	get emberUrl(){ return this.userSettingsForm.get('emberUrl'); }
	get teamUrl(){ return this.userSettingsForm.get('teamUrl'); }
	get cache(){ return this.userSettingsForm.get('cache'); }

	/**
	 * submits changes to a user's profile
	 * @param {boolean} submitType are we canceling or submitting user profile changes?
	 * @return {boolean} return false to prevent bubbling.
	 */
	submit(submitType:boolean): boolean {

		// just close form if no submit type
		if(!submitType){
			this.resetForm();
			return;
		}

		// if form is invalid then do nothing
		if(this.userSettingsForm.invalid) return;

		this.toastr.showToast('Saving user profile settings.', 'info');

		const userData = this.userSettingsForm.controls;
		this.user.setUserData('username', userData.username.value);
		this.user.setUserData('port', userData.port.value);
		this.user.setUserData('devServer', userData.devServer.value);
		this.user.setUserData('emberUrl', userData.emberUrl.value);
		this.user.setUserData('teamUrl', userData.teamUrl.value);
		this.user.setUserData('cache', userData.cache.value);

		this.userCredsChanged(userData);
		return false;
	}

	userCredsChanged(userData){

		// if creds have not been changed then do nothing
		if(userData.password.value === this.user.password && userData.username.value === this.user.username){
			return false;
		}

		// if only username changed then reload everything right now
		if(userData.password.value === this.user.password && userData.username.value !== this.user.username){
			this.userCredsChangedEvent.emit();
			this.reloadSettings();
		}

		// if user password changed then process it then reload
		if(userData.password.value !== this.user.password){
			this.toastr.showToast('Encrypting password', 'info');

			this.user.encryptPassword(userData.password.value)
				.subscribe(
					response => {
						this.user.setUserData('password', response.data);
						this.userCredsChangedEvent.emit();
						this.reloadSettings();
					},
					error => this.toastr.showToast(error, 'error')
				);
		}

	}

	reloadSettings(){
		this.toastr.showToast('Saved User Settings', 'success');
		this.getProfile();
		this.reloadPage();
	}

	/**
	 * if saved URL exists redirects user to a saved URL (from a previous redirection) 
	 * or default navigates to home page.
	 */
 	reloadPage():void {
 		if(this.user.redirectUrl){
 			const url = this.user.redirectUrl;
 			this.user.redirectUrl = '';
 			this.router.navigate([url]); 		
 		}
			
		this.router.navigate(['/']);
 	}

	/**
	 * Validator for the username form input. Requires 6 cahracters with ccnnnc or ccnnnn format
	 * where c is a character and n is a number.
	 * @param {AbstractionControl} the username control object to test
	 * @return {boolean} is the username valid?
	 */
	static usernameValidator(control: AbstractControl): {[key: string]:any} {
		const invalidUsername = control.value && /^[A-Za-z]{2}[0-9]{3}[A-Za-z0-9]$/.test(control.value);
		return invalidUsername ? null : {usernameValidator: {value: control.value}} ;
	}

	/**
	 * Validator for the port form input. A valid port must be four numbers long.
	 * @param {AbstractionControl} the port control object to test
	 * @return {boolean} is the port valid?
	 */
	static portValidator(control: AbstractControl): {[key: string]:any} {
		const validPort = control.value && /^[0-9]{4}$/.test(control.value);
		return validPort ? null : {portValidator: {value: control.value}} ;
	}
}
