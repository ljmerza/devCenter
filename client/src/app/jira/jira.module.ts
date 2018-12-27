import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
import { RouterModule } from '@angular/router';
import { MomentModule } from 'ngx-moment';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { JiraRoutingModule } from './jira-routing.module';
import { PanelModule } from '@app/panel';

import { 
  TicketsEffects, BranchInfoEffects, CommentEffects,
  AdditionalDetailsEffects, StatusEffects, QaGeneratorEffects 
} from './effects';

import { 
  TicketsService, BranchInfoService, CommentsService, 
  AdditionalDetailsService, StatusService, WatcherService 
} from './services';

import { jiraReducer } from './reducers';

import {
  TicketsComponent, ActionsComponent, CommentsComponent, BranchInfoComponent, UserChatComponent, QaGeneratorBranchesComponent,
  LoadingTableComponent, UserDetailsComponent, AddLogComponent, LoggedComponent, BranchInfoBodyComponent, WatchersComponent,
  PullRequestsComponent, TicketDetailsComponent, LoadingDetailsComponent, StatusComponent, QaGeneratorComponent
} from './components';

@NgModule({

  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    MomentModule,

    PanelModule,
    NgbTimepickerModule,

    StoreModule.forFeature('jira', jiraReducer),
    
    EffectsModule.forFeature([
      TicketsEffects, BranchInfoEffects, StatusEffects,
      CommentEffects, AdditionalDetailsEffects, QaGeneratorEffects
     ]),

    JiraRoutingModule
  ],
  providers: [
    TicketsService, BranchInfoService, CommentsService, 
    AdditionalDetailsService, StatusService, WatcherService
  ],
  declarations: [
    TicketsComponent, ActionsComponent, LoadingTableComponent, UserChatComponent, QaGeneratorComponent,
    UserDetailsComponent, PullRequestsComponent, TicketDetailsComponent, LoggedComponent, StatusComponent,
    LoadingDetailsComponent, CommentsComponent, BranchInfoComponent, AddLogComponent, BranchInfoBodyComponent, QaGeneratorBranchesComponent, WatchersComponent
  ]
})
export class JiraModule {}
