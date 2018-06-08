import { Component, ViewChild, ViewContainerRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '@services';
import { ModalComponent } from '@modal';

@Component({
	selector: 'dc-logout',
	templateUrl: './logout.component.html',
	styleUrls: ['./logout.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutComponent {
	@ViewChild(ModalComponent) modal: ModalComponent;

	constructor(public user: UserService, private router: Router) { }

	/**
	 * resets all local user settings and redirects to login page
	 */
	public resetUser(): void {
		this.modal.closeModal();
		this.user.resetUserData();
		this.router.navigate(['/login']);
	}
}
