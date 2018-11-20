import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
import { RouterModule } from '@angular/router';
import { MomentModule } from 'ngx-moment';

import { JiraRoutingModule } from './jira-routing.module';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { JiraEffects } from './jira.effects';
import { JiraService } from './jira.service';
import { JiraReducer } from './jira.reducer';

import { TicketsComponent } from './components/tickets/tickets.component';
import { TicketListComponent } from './components/ticket-list/ticket-list.component';
import { ActionsComponent } from './components/actions/actions.component';
import { LoadingTableComponent } from './components/loading-table/loading-table.component';

@NgModule({

  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    MomentModule,

    StoreModule.forFeature('jira', JiraReducer),
    EffectsModule.forFeature([JiraEffects]),

    JiraRoutingModule
  ],
  providers: [JiraService],
  declarations: [TicketsComponent, TicketListComponent, ActionsComponent, LoadingTableComponent]
})
export class JiraModule {}
