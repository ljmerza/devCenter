import { Component, Input, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ModalComponent } from '@modal';
import { UserService } from '@services';

@Component({
	selector: 'dc-navbar-user',
	templateUrl: './navbar-user.component.html',
	styleUrls: ['./navbar-user.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarUserComponent {
	@ViewChild(ModalComponent) modal:ModalComponent;
	@Input() userProfile;

	constructor(public user: UserService) { }


	aboutModel;
	openAboutModal(){
		this.modal.openModal();
	}

	closeAboutModal(){
		this.modal.closeModal();
	}

}
