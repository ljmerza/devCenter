import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';

import { RouterModule } from '@angular/router';
import { JiraRoutingModule } from './jira-routing.module';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { JiraEffects } from './jira.effects';
import { JiraService } from './jira.service';
import { JiraReducer } from './jira.reducer';

import { TicketsComponent } from './components/tickets/tickets.component';
@NgModule({

  imports: [
    CommonModule,
    SharedModule,
    
    RouterModule,

    StoreModule.forFeature('jira', JiraReducer),
    EffectsModule.forFeature([JiraEffects]),

    JiraRoutingModule
  ],
  providers: [JiraService],
  declarations: [TicketsComponent]
})
export class JiraModule {}
