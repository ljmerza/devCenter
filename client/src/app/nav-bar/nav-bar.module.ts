import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '@app/shared';
import { PanelModule } from '@app/panel';
import { SettingsModule } from '@app/settings/settings.module';

import { NavBarEffects } from './nav-bar.effects';
import { NavBarService } from './nav-bar.service';
import { navBarReducer } from './nav-bar.reducer';

import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { DropdownMenuComponent } from './components/dropdown-menu/dropdown-menu.component';
import { DropdownItemComponent } from './components/dropdown-item/dropdown-item.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { LogTimeComponent } from './components/log-time/log-time.component';
import { ProfileDropdownComponent } from './components/profile-dropdown/profile-dropdown.component';

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		RouterModule,

		PanelModule,
		SettingsModule,
		
		StoreModule.forFeature('navbar', navBarReducer),
		EffectsModule.forFeature([NavBarEffects])
	],
	declarations: [
		NavBarComponent, DropdownMenuComponent, 
		DropdownItemComponent, SearchBarComponent,
		LogTimeComponent, ProfileDropdownComponent
	],
	providers: [NavBarService],
	exports: [NavBarComponent]
})
export class NavBarModule {}
