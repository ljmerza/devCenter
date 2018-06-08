import { Component, ViewChild, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { ModalComponent } from '@modal';
import { UserSettingsComponent } from './../user-settings/user-settings.component';
import { JiraService, ToastrService, UserService } from '@services';

@Component({
	selector: 'dc-user-settings-modal',
	templateUrl: './navbar-modal.component.html',
	styleUrls: ['./navbar-modal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarModalComponent {
	modalSize = '500px 600px';

	@ViewChild('userModal') private userModal;
	@ViewChild(ModalComponent) modal: ModalComponent;
	@ViewChild(UserSettingsComponent) userSettings: UserSettingsComponent;

	constructor() {}	

	/**
	 * 
	 */
	willSaveSettings(isSaving=false): void {
		this.modal.closeModal();
		this.userSettings.submit(isSaving);
	}
}

