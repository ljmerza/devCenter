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

import { JiraService } from './services/jira.service';
import { JiraServiceTest } from './services/testing/jira.service';
import { DataService } from './services/data.service';
import { UserService } from './services/user.service';
import { ToastrService } from './services/toastr.service';
import { ConfigService } from './services/config.service';
import { WebSocketService } from './services/web-socket.service';

import { WorkTimePipe } from './work-time.pipe';
import { SafehtmlPipe } from './safehtml.pipe';
import { CommentFormatPipe } from './comment-format.pipe';

import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { TicketsComponent } from './tickets/tickets.component';
import { QaGeneratorComponent } from './qa-generator/qa-generator.component';
import { FooterComponent } from './footer/footer.component';
import { JiraCommentsComponent } from './jira-comments/jira-comments.component';
import { StatusModalComponent } from './status-modal/status-modal.component';
import { TimeLogComponent } from './time-log/time-log.component';
import { LogoutComponent } from './logout/logout.component';
import { TicketComponent } from './ticket/ticket.component';
import { SetPingsComponent } from './set-pings/set-pings.component';
import { ToastrComponent } from './toastr/toastr.component';
import { TicketDetailsComponent } from './ticket-details/ticket-details.component';

import { environment } from '../environments/environment';
import { ModalComponent } from './modal/modal.component';
import { TicketStatusComponent } from './ticket-status/ticket-status.component';

@NgModule({
	declarations: [
		AppComponent, NavBarComponent, UserSettingsComponent,
		TicketsComponent, WorkTimePipe, QaGeneratorComponent,
		FooterComponent, JiraCommentsComponent, SafehtmlPipe,
		StatusModalComponent, TimeLogComponent, LogoutComponent,
		TicketComponent, CommentFormatPipe, SetPingsComponent,
		ToastrComponent, TicketDetailsComponent, ModalComponent, TicketStatusComponent
	],
	imports: [
		BrowserModule, FormsModule, NgbModule.forRoot(),
		ReactiveFormsModule, DataTablesModule,
		HttpClientModule, MomentModule,
		AppRoutingModule, NgProgressModule,
		BrowserAnimationsModule, ToastModule.forRoot()
	],
	providers: [
		DataService, UserService, JiraServiceTest,
		ToastrService, ConfigService, WebSocketService,
		// if in testing mode use test endpoint else use regular endpoints
		{ provide: JiraService, useClass: environment.test ? JiraServiceTest : JiraService}
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
