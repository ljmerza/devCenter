import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketsComponent } from './ticketModule/tickets/tickets.component';
import { UserSettingsComponent } from './navbarModule/user-settings/user-settings.component';

import { ProfileGuard } from './profile.guard'

const routes: Routes = [
	{
		path: '', 
		component: TicketsComponent, 
		canActivate: [ProfileGuard]
	},
	{
		path: 'jira/:filter', 
		component: TicketsComponent, 
		canActivate: [ProfileGuard]
	},
	{
		path: 'login',
		component: UserSettingsComponent
	},
	{
		path: '', 
		redirectTo: '/jira/mytickets', 
		pathMatch: 'full', 
		canActivate: [ProfileGuard]
	},
	{
		path: '**', 
		redirectTo: '/jira/mytickets', 
		canActivate: [ProfileGuard]
	}
]


export const appRoutingProviders: any[] = [ProfileGuard];
export const routing = RouterModule.forRoot(routes, {useHash: true});
