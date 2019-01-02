import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TicketsComponent} from './components';

const routes: Routes = [
	{
		path: `tickets/:jql`,
		component: TicketsComponent,
		data: {title: 'Jira Tickets'},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class JiraRoutingModule {}
