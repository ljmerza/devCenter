import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { MomentModule } from 'angular2-moment';

import { NgProgressModule } from 'ngx-progressbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { AppComponent } from './app.component';

import { NotFoundComponent } from './not-found/not-found.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { TicketsComponent } from './tickets/tickets.component';

import { JiraService } from './services/jira.service';
import { DataService } from './services/data.service';
import { UserService } from './services/user.service';

import { WorkTimePipe } from './work-time.pipe';

@NgModule({
	declarations: [
		AppComponent,
		NavBarComponent,
		UserSettingsComponent,
		TicketsComponent,
		NotFoundComponent,
		WorkTimePipe
	],
	imports: [
		BrowserModule,
		FormsModule,
		NgxDatatableModule,
		HttpModule,
		MomentModule,
		AppRoutingModule,
		NgProgressModule,
		NgbModule.forRoot()
	],
	providers: [DataService, JiraService, UserService],
	bootstrap: [AppComponent]
})
export class AppModule { }
