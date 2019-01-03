import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Injectable} from '@angular/core';

import {Store, select} from '@ngrx/store';
import {selectSettings} from '@app/settings/settings.selectors';
import {SettingsService} from '@app/settings/settings.service';
import {map} from 'rxjs/operators';

@Injectable()
export class SettingsGuard implements CanActivate {
	constructor(private store: Store<{}>, private router: Router, private settingsService: SettingsService) {}

	/**
	 * if we already have all settings we need then don't go to settings route
	 * @param {ActivatedRouteSnapshot} route
	 * @param {RouterStateSnapshot} state
	 */
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		this.settingsService.redirectUrl = state.url;

		return this.store.pipe(
			select(selectSettings),
			map((settings: any) => {
				const hasCreds = settings.username && settings.password;
				const hasUrls = settings.emberUrl && settings.teamUrl && settings.teamUrl;

				if (hasCreds && hasUrls && settings.theme) {
					this.router.navigateByUrl('/jira/tickets/mytickets');
					return false;
				}

				return true;
			})
		);
	}
}
