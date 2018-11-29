import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { selectProfile } from '@app/nav-bar/nav-bar.selectors';

import { selectStatusTickets } from '../../selectors'

@Component({
  selector: 'dc-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusComponent implements OnDestroy, OnInit {
  profile$: Subscription;
  profile;

  ticket$: Subscription;
  ticket;

  @Input() key: string = '';

  constructor(public store: Store<{}>) { }

  ngOnInit() {
    this.profile$ = this.store.pipe(select(selectProfile))
      .subscribe(profile => this.profile = profile);

    this.ticket$ = this.store.pipe(
      select(selectStatusTickets),
      map(tickets => tickets.find(ticket => ticket.key === this.key)),
      distinctUntilChanged()
    )
      .subscribe(ticket => this.ticket = ticket);
  }

  ngOnDestroy() {
    this.profile$.unsubscribe();
    this.ticket$.unsubscribe();
  }

  buildStatusDropdown(){
    
  }


}
