import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// custom modules
import { routing, appRoutingProviders } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { NavbarModule } from './navbarModule/navbar.module';
import { CommentsModule } from './commentsModule/comments.module';
import { TicketModule } from './ticketModule/ticket.module';

// components
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';

import { environment } from '../environments/environment';

@NgModule({
	declarations: [AppComponent, FooterComponent],
	imports: [
		BrowserModule, routing, SharedModule.forRoot(), 
		TicketModule, NavbarModule, CommentsModule
	],
	providers: [appRoutingProviders],
	bootstrap: [AppComponent]
})
export class AppModule { }
