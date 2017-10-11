import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MomentModule } from 'angular2-moment';
import { MaterializeModule } from 'angular2-materialize';

import { DataTablesModule } from 'angular-datatables';

import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';

import { NavBarComponent } from './nav-bar/nav-bar.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { OpenTicketsComponent } from './open-tickets/open-tickets.component';

import { JiraService } from './services/jira.service';
import { DataService } from './services/data.service';

import { EstimatePipe } from './estimate.pipe';
import { LoggedPipe } from './logged.pipe';

@NgModule({
	declarations: [
		AppComponent,
		NavBarComponent,
		UserSettingsComponent,
		OpenTicketsComponent,
		NotFoundComponent,
		EstimatePipe,
		LoggedPipe
	],
	imports: [
		BrowserModule,
		FormsModule,
		DataTablesModule,
		HttpModule,
		MomentModule,
		MaterializeModule,
		AppRoutingModule
	],
	providers: [DataService, JiraService],
	bootstrap: [AppComponent]
})
export class AppModule { }
