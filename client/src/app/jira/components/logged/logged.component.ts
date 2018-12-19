import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { selectCommentsTickets } from '../../selectors';
import { CommentTicket, TicketDate } from '../../models';

@Component({
  selector: 'dc-logged',
  templateUrl: './logged.component.html',
  styleUrls: ['./logged.component.css']
})
export class LoggedComponent implements OnInit, OnDestroy {
  dates: TicketDate;
  dates$: Subscription;

  @Input() key;
  constructor(public store: Store<{}>, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.dates$ = this.store.pipe(
      select(selectCommentsTickets), 
      map((tickets: CommentTicket[]) => tickets.find(ticket => ticket.key === this.key)),
        distinctUntilChanged()
      )
      .subscribe((ticket: CommentTicket) => this.dates = ticket && ticket.dates);
  }

  ngOnDestroy(){
    this.dates$.unsubscribe();
  }
}
