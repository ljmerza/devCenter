import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TicketsComponent} from './components';

export const routes: Routes = [
	{
		path: `tickets/:jql`,
		component: TicketsComponent,
		data: {title: 'Jira Tickets'},
	},
	{
		path: `**`,
		redirectTo: `tickets/mytickets`,
		data: {title: 'Jira Tickets'},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class JiraRoutingModule {}
