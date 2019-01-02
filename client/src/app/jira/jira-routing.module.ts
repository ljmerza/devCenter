import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TicketsComponent } from './components';

const routes: Routes = [
    {
        path: `:jql`,
        component: TicketsComponent,
        data: { title: 'Jira Tickets' }
    },
    {
        path: '**',
        redirectTo: `mytickets`
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class JiraRoutingModule { }
