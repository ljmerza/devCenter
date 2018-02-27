import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { UserService } from '@services';

@Injectable()
export class ProfileGuard implements CanActivate {

	constructor(private user: UserService, private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		// get current URL user is trying to access
		let url:string = state.url;

		// Store the attempted URL for redirecting
    	this.user.redirectUrl = url;

    	console.log('this.user.needRequiredCredentials(): ', this.user.needRequiredCredentials());

    	// does user need creds set?
		if(!this.user.needRequiredCredentials()) return true;
		
		// user needs creds so redirect to login page
		this.router.navigate(['/login']);
    	return false;
	}
}