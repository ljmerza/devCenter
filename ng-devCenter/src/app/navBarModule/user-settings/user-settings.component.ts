import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { select, NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import { ProfileService, ToastrService, JiraPingsService, UserService } from '@services';
import { RootState, Actions } from '@store';

@Component({
	selector: 'dc-user-settings',
templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
	userSettingsForm: FormGroup;
	@Input() isLogin:boolean = true;
	@select('userProfile') getProfile$: Observable<any>;

	constructor(
		public user: UserService, private jira: JiraPingsService, private toastr: ToastrService, 
		public route: ActivatedRoute, private router: Router, private profile: ProfileService, public store:NgRedux<RootState>
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

	/**
	 * Subscribe to URL route changes to see if user needs credentials,
	 * if yes then if login page then redirect else get user profile.
	 */
	ngOnInit() {
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
				this.setUserPings(profile.data.pingSettings);
				this.store.dispatch({type: Actions.userProfile, payload: profile.data });
			},
			this.profile.processErrorResponse.bind(this.profile)
		);
	}

	/**
	 * sets a user's ping values on the form
	 * @param {Object} pingSettings
	 */
	setUserPings(pingSettings:any={}):void{
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

	/**
	 * Resets the user form to default seetings. Checks for ping setting resets.
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
		// if(this.user.userData) this.setUserPings(this.user.userData.ping_settings);
	}

	/**
	 * getters for ngform objects
	 */
	get username(){ return this.userSettingsForm.get('username'); }
	get password(){ return this.userSettingsForm.get('password'); }
	get port(){ return this.userSettingsForm.get('port'); }
	get emberUrl(){ return this.userSettingsForm.get('emberUrl'); }
	get teamUrl(){ return this.userSettingsForm.get('teamUrl'); }
	get cache(){ return this.userSettingsForm.get('cache'); }
	get pings() { return this.userSettingsForm.get('pings'); }

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

		// save data to localstorage
		const userData = this.userSettingsForm.controls;
		this.user.setUserData('username', userData.username.value);
		this.user.setUserData('password', userData.password.value);
		this.user.setUserData('port', userData.port.value);
		this.user.setUserData('emberUrl', userData.emberUrl.value);
		this.user.setUserData('teamUrl', userData.teamUrl.value);
		this.user.setUserData('cache', userData.cache.value);

		if(!this.pings.pristine){
			this.savePingSettings();
		} else {
			this.toastr.showToast('Saved User Settings', 'success');
			this.reloadPage();
		}

		return false;
	}

	/**
	 * if saved URL exists redirects user to a saved URL (from a previous redirection), reloads
	 * the current page if username/password changed, or default navigates to home page.
	 */
 	reloadPage():void {
 		this.resetForm();
 		const controls = this.userSettingsForm.controls;

 		if(this.user.redirectUrl){
 			const url = this.user.redirectUrl;
 			this.user.redirectUrl = '';
 			this.router.navigate([url]); 		
 		} else if((controls.username.dirty || controls.password.dirty) && !this.isLogin){
			location.reload();
		}
			
		this.router.navigate(['/']);
 	}

 	/**
 	 * saves user's ping settings. (currently only saves the allPing setting)
 	 */
 	savePingSettings(){
 		let pingControlGroup = this.pings;

 		const postData = {
 			fields: [
 				{name:'all_ping', value:pingControlGroup.get('allPing').value ? 1 : 0}
 			]
 		}

 		this.jira.setPingSettings(postData).subscribe(response => {
 			this.toastr.showToast('Saved User Settings', 'success');
 			this.reloadPage();
		});
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
