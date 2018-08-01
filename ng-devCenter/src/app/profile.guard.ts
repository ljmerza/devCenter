import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { UserService } from '@services';

@Injectable()
export class ProfileGuard implements CanActivate {

	constructor(private user: UserService, private router: Router) {}

	/**
	 * check to make sure user is logged in before going to ticket route
	 * save url for redirection after login
	 * @param {ActivatedRouteSnapshot} route
	 * @param {RouterStateSnapshot} state
	 */
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    	this.user.redirectUrl = state.url;
		if(!this.user.needRequiredCredentials()) return true;
		
		this.router.navigate(['/login']);
    	return false;
	}
}