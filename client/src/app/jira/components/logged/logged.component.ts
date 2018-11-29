import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { selectDatesTickets } from '../../selectors';

@Component({
  selector: 'dc-logged',
  templateUrl: './logged.component.html',
  styleUrls: ['./logged.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoggedComponent implements OnInit, OnDestroy {
  dates = {};
  dates$: Subscription;

  @Input() key;

  constructor(public store: Store<{}>, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.dates$ = this.store.pipe(
        select(selectDatesTickets), 
        map(tickets => tickets.find(ticket => ticket.key === this.key)),
        distinctUntilChanged()
      )
      .subscribe(dates => {
        this.dates = dates;
        this.cd.markForCheck();
      });
  }

  ngOnDestroy(){
    this.dates$.unsubscribe();
  }
}
