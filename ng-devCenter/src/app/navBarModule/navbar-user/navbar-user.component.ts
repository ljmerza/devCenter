import { Component, Input, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '@angular-redux/store';

import { Actions, RootState } from '@store';
import { ModalComponent } from '@modal';
import { UserService } from '@services';
import { appVersion  } from './../../app.version';

@Component({
	selector: 'dc-navbar-user',
	templateUrl: './navbar-user.component.html',
	styleUrls: ['./navbar-user.component.scss']
})
export class NavbarUserComponent implements OnInit, OnDestroy{
	modalSizeAbout = {
        width: () => window.innerWidth/2,
        height: () => window.innerHeight/1.5
    };
    
	aboutModel;
	packageFile;
	frontendVersions = [];

	userProfile;
	userProfile$;

	@ViewChild(ModalComponent) modal:ModalComponent;

	constructor(public user: UserService, private store:NgRedux<RootState>) { 
		this.formatPackageVersions();
	}

	/**
	 * get all library versions and format them for the table UI
	 */
	formatPackageVersions(){
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

	ngOnInit(){
		if(!this.user.needRequiredCredentials()){
			this.getUserProfile();
		}
	}

	ngOnDestroy(){
		if(this.userProfile$) this.userProfile$.unsubscribe();
	}

	getUserProfile(){
		this.userProfile$ = this.store.select('userProfile')
		.subscribe(profile => this.userProfile = profile);
	}
}
