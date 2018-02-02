import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgRedux, NgReduxModule, DevToolsExtension } from '@angular-redux/store';
import { RootState, initialState, rootReducer } from './shared/store/store';

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
		BrowserModule, routing, 
		SharedModule.forRoot(), 
		TicketModule, NavbarModule, CommentsModule, NgbModule.forRoot()
	],
	providers: [
		appRoutingProviders, Location, 
		{provide: LocationStrategy, useClass: HashLocationStrategy}
	],
	bootstrap: [AppComponent]
})
export class AppModule {
	constructor(private ngRedux:NgRedux<RootState>, private devTools: DevToolsExtension){
		ngRedux.configureStore(rootReducer, initialState, [], [devTools.enhancer()]);
	}
}
