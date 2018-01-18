import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { NgModule } from '@angular/core';


// modules
import { DataTablesModule } from 'angular-datatables';
import { NgProgressModule } from 'ngx-progressbar';

// custom modules
import { SharedModule } from './shared/shared.module';
import { NavbarModule } from './navbarModule/navbar.module';
import { CommentsModule } from './commentsModule/comments.module';
import { TicketModule } from './ticketModule/ticket.module';


import { AppComponent } from './app.component';
import { TicketsComponent } from './tickets/tickets.component';
import { FooterComponent } from './footer/footer.component';

import { environment } from '../environments/environment';

@NgModule({
	declarations: [AppComponent, TicketsComponent, FooterComponent],
	imports: [
		BrowserModule, DataTablesModule,
		SharedModule.forRoot(), TicketModule, NavbarModule, CommentsModule,
		AppRoutingModule, NgProgressModule, 
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
