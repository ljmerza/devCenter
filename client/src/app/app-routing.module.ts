import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {environment as env} from '@env/environment';

import {SettingsContainerComponent} from './settings';
import {ProfileGuard} from './profile-guard.service';
import {SettingsGuard} from './settings-guard.service';

export const routes: Routes = [
	{
		path: ``,
		redirectTo: `jira/tickets/mytickets`,
		pathMatch: 'full',
		data: {title: 'Jira Tickets'},
	},
	{
		path: `settings`,
		component: SettingsContainerComponent,
		data: {title: 'settings'},
		canActivate: [SettingsGuard],
	},
	{
		path: `jira`,
		loadChildren: 'app/jira/jira.module#JiraModule',
		canActivate: [ProfileGuard],
	},
	{
		path: `**`,
		redirectTo: `jira/tickets/mytickets`,
		data: {title: 'Jira Tickets'},
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes, {useHash: true})],
	exports: [RouterModule],
})
export class AppRoutingModule {}
