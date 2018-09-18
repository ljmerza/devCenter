import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER  } from '@angular/core';
import { HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

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
import { InitService } from './init.service';
import { Actions } from '@store';


export function startupServiceFactory(initService: InitService): Function {
    return () => initService.getStartupData();
}

@NgModule({
	declarations: [AppComponent, FooterComponent],
	imports: [
		BrowserModule, routing, SharedModule.forRoot(), OrderModule, 
		TicketModule, NavbarModule, CommentsModule, NgbModule.forRoot(), MetricsModule
	],
	providers: [
		appRoutingProviders, Location, 
		{provide: LocationStrategy, useClass: HashLocationStrategy},
		InitService,
		{
            provide: APP_INITIALIZER,
            useFactory: startupServiceFactory,
            deps: [InitService],
            multi: true
        }
	],
	bootstrap: [AppComponent]
})
export class AppModule {}
