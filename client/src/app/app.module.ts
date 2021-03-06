import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {ToastContainerModule} from 'ngx-toastr';
import {SharedModule} from '@app/shared';
import {CoreModule} from '@app/core';

import {SettingsModule} from './settings/settings.module';

import {AppRoutingModule} from './app-routing.module';
import {NavBarModule} from './nav-bar';
import {AppComponent} from './app.component';

import {ProfileGuard} from './profile-guard.service';
import {SettingsGuard} from './settings-guard.service';

@NgModule({
	imports: [
		// angular
		BrowserAnimationsModule,
		BrowserModule,

		// core & shared
		CoreModule,
		SharedModule,

		// features
		SettingsModule,
		NavBarModule,
		ToastContainerModule,

		// app
		AppRoutingModule,
	],
	declarations: [AppComponent],
	providers: [ProfileGuard, SettingsGuard],
	bootstrap: [AppComponent],
})
export class AppModule {}
