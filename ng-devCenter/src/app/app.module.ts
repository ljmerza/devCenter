import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { NgModule } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MomentModule } from 'angular2-moment';

import { DataTablesModule } from 'angular-datatables';

import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';

import { NavBarComponent } from './nav-bar/nav-bar.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { OpenTicketsComponent } from './open-tickets/open-tickets.component';

import { JiraService } from './services/jira.service';
import { DataService } from './services/data.service';
import { UserService } from './services/user.service';

import { WorkTimePipe } from './work-time.pipe';

@NgModule({
	declarations: [
		AppComponent,
		NavBarComponent,
		UserSettingsComponent,
		OpenTicketsComponent,
		NotFoundComponent,
		WorkTimePipe
	],
	imports: [
		BrowserModule,
		FormsModule,
		DataTablesModule,
		HttpModule,
		MomentModule,
		AppRoutingModule,
		NgbModule.forRoot()
	],
	providers: [DataService, JiraService, UserService],
	bootstrap: [AppComponent]
})
export class AppModule { }
