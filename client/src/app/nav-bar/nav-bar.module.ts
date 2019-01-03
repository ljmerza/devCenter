import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';

import {SharedModule} from '@app/shared';
import {PanelModule} from '@app/panel';
import {SettingsModule} from '@app/settings';

import {NavBarEffects, NavBarLinksEffects, NavBarSearchEffects, NavBarStatusEffects} from './effects';
import {NavBarService, NavBarLinksService, NavBarSearchService, NavBarStatusService} from './services';
import {navBarReducer} from './reducers';
import {NavBarComponent, DropdownMenuComponent, DropdownItemComponent, LogoutComponent, SearchBarComponent, LogTimeComponent, ProfileDropdownComponent} from './components';

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		RouterModule,

		PanelModule,
		SettingsModule,

		StoreModule.forFeature('navbar', navBarReducer),
		EffectsModule.forFeature([NavBarEffects, NavBarLinksEffects, NavBarSearchEffects, NavBarStatusEffects]),
	],
	declarations: [NavBarComponent, DropdownMenuComponent, DropdownItemComponent, SearchBarComponent, LogTimeComponent, ProfileDropdownComponent, LogoutComponent],
	providers: [NavBarService, NavBarLinksService, NavBarSearchService, NavBarStatusService],
	exports: [NavBarComponent],
})
export class NavBarModule {}
