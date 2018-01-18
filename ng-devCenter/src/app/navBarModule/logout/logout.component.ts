import { 
	Component, ViewChild,
	ElementRef, ViewContainerRef, 
	ViewEncapsulation, ChangeDetectionStrategy
} from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from './../../shared/services/user.service';

@Component({
	selector: 'dc-logout',
	templateUrl: './logout.component.html',
	styleUrls: ['./logout.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutComponent {
	@ViewChild('logoutModal') content:ElementRef;

	constructor(public user: UserService, private modalService:NgbModal) { }

	/*
	*/
	public resetUserSettings(): void {

		this.modalService.open(this.content).result.then( confirm => {

			// if we logout delete user data then reload page
			if(confirm){
				this.user.resetUserData();
				window.location.reload();
			}
		});

	}

}
