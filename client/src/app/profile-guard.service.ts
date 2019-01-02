import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { Store, select } from '@ngrx/store';
import { selectSettings } from '@app/settings/settings.selectors';
import { map } from "rxjs/operators";

@Injectable()
export class ProfileGuard implements CanActivate {
    redirectUrl:string = '';

    constructor(private store: Store<{}>, private router: Router) {}

	/**
	 * check to make sure user is logged in before going to ticket route
	 * save url for redirection after login
	 * @param {ActivatedRouteSnapshot} route
	 * @param {RouterStateSnapshot} state
	 */
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.redirectUrl = state.url;

        return this.store.pipe(
            select(selectSettings),
            map((settings:any) => {
                if (!settings || !settings.username || !settings.password) {
                    this.router.navigate(['/settings']);
                    return false;
                }

                return true;
            })
        );
	}
}