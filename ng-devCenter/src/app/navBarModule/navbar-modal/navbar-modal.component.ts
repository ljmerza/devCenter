import { 
	Component, ViewChild,
	ViewEncapsulation, ChangeDetectionStrategy
} from '@angular/core';

import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './../../shared/modal/modal.component';
import { UserSettingsComponent } from './../user-settings/user-settings.component';

import { UserService } from './../../shared/services/user.service'
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';


@Component({
  selector: 'dc-user-settings-modal',
  templateUrl: './navbar-modal.component.html',
  styleUrls: ['./navbar-modal.component.scss']
})
export class NavbarModalComponent {
	modalInstance: NgbModalRef;
	customModalCss = 'userSettings';

	@ViewChild('userModal') private userModal;
	@ViewChild(ModalComponent) modal: ModalComponent;
	@ViewChild(UserSettingsComponent) userSettings: UserSettingsComponent;

	constructor() {}	

	/**
	*/
	openModal(): void {
		this.modalInstance = this.modal.openModal();
	}

	/**
	*/
	closeModal(isSaving?): void {
		// see if we need to save data then close modal
		this.userSettings.submit(isSaving);
		this.modalInstance.close();
	}
}

