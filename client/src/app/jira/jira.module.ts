import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
import { RouterModule } from '@angular/router';
import { MomentModule } from 'ngx-moment';

import { JiraRoutingModule } from './jira-routing.module';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PanelModule } from '@app/panel';

import { TicketsEffects, BranchInfoEffects, CommentEffects, AdditionalDetailsEffects, StatusEffects } from './effects';
import { TicketsService, BranchInfoService, CommentsService, AdditionalDetailsService, StatusService } from './services';
import { TicketsReducer } from './reducers';

import {
  TicketsComponent, ActionsComponent, CommentsComponent, BranchInfoComponent,
  LoadingTableComponent, UserDetailsComponent, AddLogComponent, LoggedComponent,
  PullRequestsComponent, TicketDetailsComponent, LoadingDetailsComponent, StatusComponent
} from './components';

import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { BranchInfoBodyComponent } from './components/branch-info-body/branch-info-body.component';

@NgModule({

  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    MomentModule,

    PanelModule,
    NgbTimepickerModule,

    StoreModule.forFeature('jira', TicketsReducer),
    
    EffectsModule.forFeature([
      TicketsEffects, BranchInfoEffects, StatusEffects,
      CommentEffects, AdditionalDetailsEffects
     ]),

    JiraRoutingModule
  ],
  providers: [TicketsService, BranchInfoService, CommentsService, AdditionalDetailsService, StatusService],
  declarations: [
    TicketsComponent, ActionsComponent, LoadingTableComponent,
    UserDetailsComponent, PullRequestsComponent, TicketDetailsComponent, 
    LoadingDetailsComponent, CommentsComponent, BranchInfoComponent, AddLogComponent, BranchInfoBodyComponent, LoggedComponent, StatusComponent
  ]
})
export class JiraModule {}
