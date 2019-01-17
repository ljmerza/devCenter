import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ApolloComponent} from './components';

export const routes: Routes = [
	{
		path: `apollo`,
		component: ApolloComponent,
		data: { title: 'Apollo Orders' },
	},
	{
		path: `**`,
		redirectTo: `apollo`,
		data: { title: 'Apollo Orders' },
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class OrdersRoutingModule {}
