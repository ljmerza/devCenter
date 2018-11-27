import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { environment as env } from '@env/environment';


import { PanelComponent } from '@app/panel/components/panel/panel.component';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { ActionAdditionalDetailsRetrieve } from '../../actions';
import { selectJiraState } from '../../selectors';
import { JiraTicketsState, JiraTicket } from '../../models';


@Component({
  selector: 'dc-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.css']
})
export class TicketDetailsComponent implements OnInit, OnDestroy {
  env = env;
  ticket: any;
  state$: Subscription;
  loading: boolean = false;

  timeLogRows = ['timeSpent','updated'];
  linkRows = ['key','summary','status'];
  statusRows = ['displayName','status'];

  @Input() key;
  @ViewChild(PanelComponent) modal: PanelComponent;

  constructor(public store: Store<{}>) { }

  ngOnInit() {

    this.state$ = this.store.pipe(
      select(selectJiraState),
      tap(state => {
        if(this.loading) this.loading = state.additionalLoading;
      }),
      map((state:JiraTicketsState) => state.additionalTickets.find(ticket => ticket.key === this.key))
    )
      .subscribe((ticket: JiraTicket) => this._processTicket(ticket));
  }

  ngOnDestroy() {
    this.state$.unsubscribe();
  }

  openModal(){
    this.loading = true;
    this.modal.openModal();
    this.store.dispatch(new ActionAdditionalDetailsRetrieve(this.key));
  }

  _processTicket(ticket: JiraTicket): void{
    if (!ticket) return;
    ticket.links.sort((a: any) => a.inwardIssue ? 1 : 0);
    this.ticket = ticket;
  }

}
