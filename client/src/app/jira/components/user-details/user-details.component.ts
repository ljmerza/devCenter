import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dc-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailsComponent implements OnInit, OnDestroy {

  constructor(public store: Store<{}>) { }
  ticket$: Subscription;

  msrp:string = '';
  username:string = '';
  displayName:string = '';
  emailAddress:string = '';

  @Input() selectorTicket;
  @Input() isCustomer;

  ngOnInit() {
    this.ticket$ = this.store.pipe(select(this.selectorTicket))
      .subscribe(ticket => {
        this.msrp = ticket && ticket.msrp;
        const details = ticket && ticket[this.isCustomer ? 'customer_details' : 'user_details'] || {};
        this.username = details.username || '';
        this.displayName = details.display_name || '';
        this.emailAddress = (this.isCustomer ? details.email : details.email_address) || '';
      });
  }

  ngOnDestroy(){
    this.ticket$.unsubscribe();
  }
}
