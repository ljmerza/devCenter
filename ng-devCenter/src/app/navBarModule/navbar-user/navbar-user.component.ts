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
	modalSizeAbout = {
        width: () => window.innerWidth/2,
        height: () => window.innerHeight/1.5
    };
    
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
}
