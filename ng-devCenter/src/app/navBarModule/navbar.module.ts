import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// custom modules
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

// components
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { LogoutComponent } from './logout/logout.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { NavbarModalComponent } from './navbar-modal/navbar-modal.component';

// directives
import { DropdownSubmenuDirective, DropdownSubmenuMenuDirective } from './dropdown-submenu.directive';
import { SearchbarComponent } from './searchbar/searchbar.component';


@NgModule({
	imports: [
		CommonModule, SharedModule, NgbModule,
		RouterModule, FormsModule, ReactiveFormsModule
	],
	declarations: [
		NavBarComponent, LogoutComponent, UserSettingsComponent,
		DropdownSubmenuDirective, DropdownSubmenuMenuDirective,
		NavbarModalComponent,
		SearchbarComponent
	],
	exports: [NavBarComponent, UserSettingsComponent]
})
export class NavbarModule {}