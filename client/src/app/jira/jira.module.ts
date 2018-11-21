import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
import { RouterModule } from '@angular/router';
import { MomentModule } from 'ngx-moment';

import { JiraRoutingModule } from './jira-routing.module';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PanelModule } from '@app/panel';

import { TicketsEffects, BranchInfoEffects } from './effects';
import { TicketsService, BranchInfoService } from './services';
import { TicketsReducer } from './reducers';

import {
  TicketsComponent, ActionsComponent,
  LoadingTableComponent, UserDetailsComponent,
  PullRequestsComponent, BranchInfoComponent 
} from './components';


@NgModule({

  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    MomentModule,

    PanelModule,

    StoreModule.forFeature('jira', TicketsReducer),
    EffectsModule.forFeature([TicketsEffects, BranchInfoEffects]),

    JiraRoutingModule
  ],
  providers: [TicketsService, BranchInfoService],
  declarations: [TicketsComponent, ActionsComponent, LoadingTableComponent, UserDetailsComponent, PullRequestsComponent, BranchInfoComponent]
})
export class JiraModule {}
