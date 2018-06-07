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
	 *
	 */
	public willResetUser(resetUser:boolean=false): void {
		if(resetUser){
			this.user.resetUserData();
			this.router.navigate(['/login']);
		}
	}

	/**
	 *
	 */
	public openModal(){
		this.modal.openModal();
	}

}
