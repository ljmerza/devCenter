import { Component, ViewChild, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ModalComponent } from '@modal';
import { UserSettingsComponent } from './../user-settings/user-settings.component';
import { JiraService, ToastrService, UserService } from '@services';

@Component({
	selector: 'dc-navbar-modal',
	templateUrl: './navbar-modal.component.html',
	styleUrls: ['./navbar-modal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarModalComponent {
	modalInstance;
	modalSize:string = 'md';

	@ViewChild('userModal') private userModal;
	@ViewChild(ModalComponent) modal: ModalComponent;
	@ViewChild(UserSettingsComponent) userSettings: UserSettingsComponent;

	constructor() {}	

	/**
	 * 
	 */
	openModal(): void {
		this.modal.openModal();
	}

	/**
	 * see if we need to save data then close modal
	 */
	closeModal(isSaving?): void {
		this.userSettings.submit(isSaving);
		this.modal.closeModal();
	}
}

