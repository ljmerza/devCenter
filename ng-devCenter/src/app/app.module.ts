import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgProgressModule } from 'ngx-progressbar';

// custom modules
import { routing, appRoutingProviders } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { NavbarModule } from './navbarModule/navbar.module';
import { CommentsModule } from './commentsModule/comments.module';
import { TicketModule } from './ticketModule/ticket.module';
import { OrderModule } from './orderModule/order.module';
import { MetricsModule } from './metricsModule/metrics.module';

// components
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';

import { environment } from '@environment';

@NgModule({
	declarations: [AppComponent, FooterComponent],
	imports: [
		BrowserModule, routing, SharedModule.forRoot(), OrderModule, BrowserAnimationsModule, 
		TicketModule, NavbarModule, CommentsModule, NgbModule.forRoot(), NgProgressModule,
		MetricsModule
	],
	providers: [
		appRoutingProviders, Location, 
		{provide: LocationStrategy, useClass: HashLocationStrategy}
	],
	bootstrap: [AppComponent]
})
export class AppModule {}
