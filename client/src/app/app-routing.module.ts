import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment as env } from '@env/environment';

import { SettingsContainerComponent } from './settings';

const routes: Routes = [
  {
    path: `${env.baseRoute}`,
    redirectTo: 'jira',
    pathMatch: 'full'
  },
  {
    path: `${env.baseRoute}settings`,
    component: SettingsContainerComponent,
    data: { title: 'settings' }
  },
  {
    path: `${env.baseRoute}jira`,
    loadChildren: 'app/jira/jira.module#JiraModule'
  },
  {
    path: '**',
    redirectTo: `${env.baseRoute}jira`
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {useHash: true, scrollPositionRestoration: 'enabled'})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
