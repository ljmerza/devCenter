import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { UserService } from '@services';

@Injectable()
export class ProfileGuard implements CanActivate {

	constructor(private user: UserService, private router: Router) {}

	/**
	 * check to make sure user is logged in before going to ticket route
	 * @param {ActivatedRouteSnapshot} route
	 * @param {RouterStateSnapshot} state
	 * @return {boolean} is user allowed to route?
	 */
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		// get current URL user is trying to access
		let url:string = state.url;

		// Store the attempted URL for redirecting
    	this.user.redirectUrl = url;

    	// does user need creds set?
		if(!this.user.needRequiredCredentials()) return true;
		
		// user needs creds so redirect to login page
		this.router.navigate(['/login']);
    	return false;
	}
}