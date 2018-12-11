import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { environment as env } from '@env/environment';

import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { ActionSettingsChangeTheme, ActionSettingsPersist, ActionSettingsEncryptPassword } from '../settings.actions';
import { SettingsState } from '../settings.model';
import { selectSettings } from '../settings.selectors';
import { NotificationService } from '@app/core/notifications/notification.service';

@Component({
  selector: 'dc-settings',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss']
})
export class SettingsContainerComponent implements OnInit, OnDestroy {
  settings: SettingsState;
  private settings$: Subscription;
  settingsForm;
  env = env;

  @Output() updateProfile = new EventEmitter();

  constructor(private store: Store<{}>, private formBuilder: FormBuilder, private notificationsService: NotificationService) {
    this.settings$ = store.pipe(select(selectSettings)).subscribe((settings:SettingsState) => {
      this.settings = settings;
      if(!this.settingsForm || settings.isThemeChange) return;

      // get any settings that dont match the form
      const changed:any = {};
      for(let setting in settings){
        if(this.settingsForm.value[setting] !== settings[setting]){
          changed[setting] = settings[setting];
        }
      }

      // if we found any values that don't match then set them on the form
      // make sure its not a theme change only cause it'll over write all other values
      const hasChanges = Object.keys(changed).length;
      if(hasChanges) this.settingsForm.patchValue(changed);

    });
  }

  ngOnInit() {
    this.settingsForm = this.formBuilder.group({
      username: [this.settings.username, Validators.compose([Validators.required,SettingsContainerComponent.usernameValidator])],
      password: [this.settings.password, [Validators.required]],
      port: [this.settings.port, Validators.compose([Validators.required,SettingsContainerComponent.portValidator])],
      devServer: [this.settings.devServer, [Validators.required]],
      emberUrl: [this.settings.emberUrl, [Validators.required]],
      teamUrl: [this.settings.teamUrl, [Validators.required]],
      tempUrl: [this.settings.tempUrl, [Validators.required]],
      cache: [this.settings.cache],
      theme: [this.settings.theme]
    });

    // change theme in store to reflect in entire app
    this.settingsForm.get('theme').valueChanges.subscribe(theme => {
      this.store.dispatch(new ActionSettingsChangeTheme({ theme }));
    });
  }

  ngOnDestroy(): void {
    this.settings$.unsubscribe();
  }

  /**
   * if any user info exist then we are updating else we are creating
   */
  get submitText(){
    const profileHasData = !!(this.settings.username || this.settings.cache || this.settings.theme ||
      this.settings.password || this.settings.port || this.settings.devServer || 
      this.settings.emberUrl || this.settings.teamUrl || this.settings.tempUrl);

    return profileHasData ? 'Update' : 'Create';
  }

  /**
   * getters for ngform objects
   */
  get username() { return this.settingsForm.get('username'); }
  get password() { return this.settingsForm.get('password'); }
  get port() { return this.settingsForm.get('port'); }
  get devServer() { return this.settingsForm.get('devServer'); }
  get emberUrl() { return this.settingsForm.get('emberUrl'); }
  get teamUrl() { return this.settingsForm.get('teamUrl'); }
  get tempUrl() { return this.settingsForm.get('tempUrl'); }
  get cache() { return this.settingsForm.get('cache'); }
  get theme() { return this.settingsForm.get('theme'); }

  /**
   * submits changes to a user's profile
   * @param {boolean} submitType are we canceling or submitting user profile changes?
   * @return {boolean} return false to prevent bubbling.
   */
  submit(): void {
    if (this.settingsForm.invalid) {
      this.notificationsService.error(`Invalid form`);
      return;
    }

    // if password has changed then encrypt it first else save settings only
    if(this.settingsForm.value.password !== this.settings.password) {
      this.store.dispatch(new ActionSettingsEncryptPassword(this.settingsForm.value));

    } else {
      this.notificationsService.info('Saving Settings');
      this.store.dispatch(new ActionSettingsPersist(this.settingsForm.value));
    }

    this.updateProfile.emit();
  }

  /**
   * Validator for the username form input. Requires 6 cahracters with ccnnnc or ccnnnn format
   * where c is a character and n is a number.
   * @param {AbstractionControl} the username control object to test
   * @return {boolean} is the username valid?
   */
  static usernameValidator(control: AbstractControl): { [key: string]: any } {
    const invalidUsername = control.value && /^[A-Za-z]{2}[0-9]{3}[A-Za-z0-9]$/.test(control.value);
    return invalidUsername ? null : { usernameValidator: { value: control.value } };
  }

  /**
   * Validator for the port form input. A valid port must be four numbers long.
   * @param {AbstractionControl} the port control object to test
   * @return {boolean} is the port valid?
   */
  static portValidator(control: AbstractControl): { [key: string]: any } {
    const validPort = control.value && /^[0-9]{4}$/.test(control.value);
    return validPort ? null : { portValidator: { value: control.value } };
  }
}
