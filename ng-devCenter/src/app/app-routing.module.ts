import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { TicketsComponent } from './tickets/tickets.component';


const appRoutes: Routes = [
	{path: '', component: TicketsComponent},
	{path: 'jira/:filter', component: TicketsComponent},
	{path: '', redirectTo: '/jira/mytickets', pathMatch: 'full'},
	{path: '**', redirectTo: '/jira/mytickets'}
]


@NgModule({
	imports: [
		RouterModule.forRoot(appRoutes, { 
			useHash: true, 
			// onSameUrlNavigation: 'refresh' // angular 5 option
		})
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
