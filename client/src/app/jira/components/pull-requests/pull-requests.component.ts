import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { selectProfile } from '@app/nav-bar/selectors';

import { selectStatusTickets } from '../../selectors'

@Component({
  selector: 'dc-pull-requests',
  templateUrl: './pull-requests.component.html',
  styleUrls: ['./pull-requests.component.css']
})
export class PullRequestsComponent implements OnDestroy, OnInit {
  profile$: Subscription;
  profile;

  ticket$: Subscription;
  ticket;

  constructor(public store: Store<{}>) { }

  @Input() key;

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

	/**
	 *
	 */
  pingUser() {
    const postData = {
      fromName: this.profile.displayName,
      toUsername: this.ticket.username,
      pullLinks: this.ticket.pullRequests,
      key: this.ticket.key,
    };

    // this.chat.sendPcrComments(postData).subscribe(
    //   response => this.toastr.showToast(response.data, 'success'),
    //   error => this.toastr.showToast(`Could not ping user: ${error.data}`, 'error')
    // )
  }
}