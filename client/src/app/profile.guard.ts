import { OnInit, OnDestroy } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { Store, select } from '@ngrx/store';
import { selectSettings } from '@app/settings/settings.selectors';
import { SettingsState } from '@app/settings/settings.model';
import { Subscription } from 'rxjs';

@Injectable()
export class ProfileGuard implements CanActivate, OnInit, OnDestroy {
    settings$: Subscription;
    settings: SettingsState;

    constructor(private store: Store<{}>, private router: Router) {}

    ngOnInit(){
        this.settings$ = this.store.pipe(select(selectSettings))
            .subscribe(settings => this.settings = settings);
    }

    ngOnDestroy(): void {
        this.settings$.unsubscribe();
    }
	/**
	 * check to make sure user is logged in before going to ticket route
	 * save url for redirection after login
	 * @param {ActivatedRouteSnapshot} route
	 * @param {RouterStateSnapshot} state
	 */
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // this.user.redirectUrl = state.url;
        
        if(this.settings.username || !this.settings.password){
            this.router.navigate(['/settings']);
            return false;
        }
        
        return true;
	}
}