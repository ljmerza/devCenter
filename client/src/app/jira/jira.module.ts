import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
import { RouterModule } from '@angular/router';
import { MomentModule } from 'ngx-moment';

import { JiraRoutingModule } from './jira-routing.module';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PanelModule } from '@app/panel';

import { TicketsEffects, BranchInfoEffects, CommentEffects, AdditionalDetailsEffects } from './effects';
import { TicketsService, BranchInfoService, CommentsService, AdditionalDetailsService } from './services';
import { TicketsReducer } from './reducers';

import {
  TicketsComponent, ActionsComponent, CommentsComponent, BranchInfoComponent,
  LoadingTableComponent, UserDetailsComponent, AddLogComponent,
  PullRequestsComponent, TicketDetailsComponent, LoadingDetailsComponent
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
      TicketsEffects, BranchInfoEffects, 
      CommentEffects, AdditionalDetailsEffects
     ]),

    JiraRoutingModule
  ],
  providers: [TicketsService, BranchInfoService, CommentsService, AdditionalDetailsService],
  declarations: [
    TicketsComponent, ActionsComponent, LoadingTableComponent,
    UserDetailsComponent, PullRequestsComponent, TicketDetailsComponent, 
    LoadingDetailsComponent, CommentsComponent, BranchInfoComponent, AddLogComponent, BranchInfoBodyComponent
  ]
})
export class JiraModule {}
