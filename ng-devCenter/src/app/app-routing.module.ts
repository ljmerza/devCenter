import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';

import { NavBarComponent } from './nav-bar/nav-bar.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { OpenTicketsComponent } from './open-tickets/open-tickets.component';


const appRoutes: Routes = [
	{path: '', component: OpenTicketsComponent},
	{path: 'jira/:filter', component: OpenTicketsComponent},
	{path: '', redirectTo: '/jira/mytickets', pathMatch: 'full'},
	{path: '**', redirectTo: '/jira/mytickets'}
]


@NgModule({
	imports: [
		RouterModule.forRoot(appRoutes, {enableTracing: true})
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }