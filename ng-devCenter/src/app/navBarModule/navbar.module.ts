import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// custom modules
import { SharedModule } from '../shared/shared.module';

// components
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { LogoutComponent } from './logout/logout.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { NavbarModalComponent } from './navbar-modal/navbar-modal.component';

// directives
import { DropdownSubmenuDirective, DropdownSubmenuMenuDirective } from './dropdown-submenu.directive';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { NavbarUserComponent } from './navbar-user/navbar-user.component';


@NgModule({
	imports: [
		CommonModule, SharedModule, NgbModule,
		RouterModule, FormsModule, ReactiveFormsModule
	],
	declarations: [
		NavBarComponent, LogoutComponent, UserSettingsComponent,
		DropdownSubmenuDirective, DropdownSubmenuMenuDirective,
		NavbarModalComponent, SearchbarComponent, NavbarUserComponent
	],
	exports: [NavBarComponent, UserSettingsComponent]
})
export class NavbarModule {}