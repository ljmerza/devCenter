import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment as env } from '@env/environment';

import { SettingsContainerComponent } from './settings';
import { ProfileGuard } from './profile-guard.service';

const routes: Routes = [
  {
    path: ``,
    redirectTo: 'jira',
    pathMatch: 'full',
  },
  {
    path: `settings`,
    component: SettingsContainerComponent,
    data: { title: 'settings' }
  },
  {
    path: `jira`,
    loadChildren: 'app/jira/jira.module#JiraModule',
    canActivate: [ProfileGuard]
  },
  {
    path: '**',
    redirectTo: `jira`
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {useHash: true, scrollPositionRestoration: 'enabled'})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
