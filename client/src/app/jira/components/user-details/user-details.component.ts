import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { environment as env } from '@env/environment';

@Component({
  selector: 'dc-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailsComponent implements OnInit, OnDestroy {

  constructor(private sanitizer: DomSanitizer, public store: Store<{}>) { }
  ticket$: Subscription;
  env = env;

  msrp:string = '';
  username:string = '';
  displayName:string = '';
  emailAddress:string = '';

  @Input() selectorTicket;
  @Input() isCustomer;

  ngOnInit() {
    this.ticket$ = this.store.pipe(select(this.selectorTicket))
      .subscribe(ticket => {
        this.msrp = ticket.msrp;
        const details = ticket[this.isCustomer ? 'customer_details' : 'user_details'];
        this.username = details.username;
        this.displayName = details.display_name;
        this.emailAddress = this.isCustomer ? details.email : details.email_address;
      });
  }

  ngOnDestroy(){
    this.ticket$.unsubscribe();
  }
  

  /**
   * generate and sanitize a chat link from a username
   */
  sanitizedChatUrl(): SafeUrl{
    return this.sanitizer.bypassSecurityTrustUrl(`${env.chatUrl}/${this.username}`)
  }

}
