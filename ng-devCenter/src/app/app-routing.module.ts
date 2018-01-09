import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
