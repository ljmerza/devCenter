import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MomentModule } from 'angular2-moment';

import { DataTablesModule } from 'angular-datatables';
import { NgProgressModule } from 'ngx-progressbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { AppComponent } from './app.component';

import { NavBarComponent } from './nav-bar/nav-bar.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { TicketsComponent } from './tickets/tickets.component';
import { QaGeneratorComponent } from './qa-generator/qa-generator.component';

import { JiraService } from './services/jira.service';
import { DataService } from './services/data.service';
import { UserService } from './services/user.service';
import { ToastrService } from './services/toastr.service';
import { ConfigService } from './services/config.service';

import { WorkTimePipe } from './work-time.pipe';
import { FooterComponent } from './footer/footer.component';
import { JiraCommentsComponent } from './jira-comments/jira-comments.component';
import { SafehtmlPipe } from './safehtml.pipe';
import { PcrModalComponent } from './pcr-modal/pcr-modal.component';
import { TimeLogComponent } from './time-log/time-log.component';
import { LogoutComponent } from './logout/logout.component';
import { TicketComponent } from './ticket/ticket.component';
import { CommentFormatPipe } from './comment-format.pipe';
import { SetPingsComponent } from './set-pings/set-pings.component';

@NgModule({
	declarations: [
		AppComponent,
		NavBarComponent,
		UserSettingsComponent,
		TicketsComponent,
		WorkTimePipe,
		QaGeneratorComponent,
		FooterComponent,
		JiraCommentsComponent,
		SafehtmlPipe,
		PcrModalComponent,
		TimeLogComponent,
		LogoutComponent,
		TicketComponent,
		CommentFormatPipe,
		SetPingsComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		DataTablesModule,
		HttpClientModule,
		MomentModule,
		AppRoutingModule,
		NgProgressModule,
		BrowserAnimationsModule,
		ToastModule.forRoot(),
		NgbModule.forRoot()
	],
	providers: [DataService, JiraService, UserService, ToastrService, ConfigService],
	bootstrap: [AppComponent]
})
export class AppModule { }
