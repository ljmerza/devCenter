import { Component, Input, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ModalComponent } from '@modal';
import { UserService } from '@services';
import { appVersion  } from './../../app.version';

@Component({
	selector: 'dc-navbar-user',
	templateUrl: './navbar-user.component.html',
	styleUrls: ['./navbar-user.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarUserComponent {
	customModalCss:string = 'navbarAbout';
	aboutModel;
	packageFile;
	frontendVersions = [];

	@ViewChild(ModalComponent) modal:ModalComponent;
	@Input() userProfile;

	constructor(public user: UserService) { 
		this.packageFile = appVersion;

		this.frontendVersions = 
		Object.keys(appVersion.dependencies)
		.map(key => {
			return {
				name: key.replace(/^@/, ''),
				version: appVersion.dependencies[key].replace(/\^|~/, '')
			}
		});
	}


	openAboutModal(){
		this.aboutModel = this.modal.openModal();
	}

	closeAboutModal(){
		this.aboutModel.close();
	}

}
