import { 
	Component, ViewChild, ViewContainerRef, 
	ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';


import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from './../../shared/services/user.service';
import { ModalComponent } from './../../shared/modal/modal.component';


@Component({
	selector: 'dc-logout',
	templateUrl: './logout.component.html',
	styleUrls: ['./logout.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutComponent {
	@ViewChild(ModalComponent) modal: ModalComponent;
	modalRef: NgbModalRef;

	constructor(public user: UserService, private router: Router) { }


	/*
	*/
	public closeModal(resetUser:boolean=false): void {
		this.modalRef.close();

		if(resetUser){
			this.user.resetUserData();
			this.router.navigate(['/login']);
		}
	}

	/**
	*/
	public openModal(){
		this.modalRef = this.modal.openModal();
	}

}
