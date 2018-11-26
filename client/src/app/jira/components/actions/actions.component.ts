import { Component, Input, OnInit, OnDestroy, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { TicketDetailsComponent } from '../ticket-details/ticket-details.component';
import { CommentsComponent } from '../comments/comments.component';


@Component({
  selector: 'dc-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'], 
  entryComponents: [TicketDetailsComponent, CommentsComponent]
})
export class ActionsComponent implements OnInit, OnDestroy {
  ticket$: Subscription;
  ticket;

  branchInfoRef;
  commentsRef;

  @Input() selectorTicket;

  constructor(public store: Store<{}>, private factoryResolver: ComponentFactoryResolver, private viewContRef: ViewContainerRef) { }

  ngOnInit() {
    this.ticket$ = this.store.pipe(select(this.selectorTicket))
      .subscribe(ticket => this.ticket = ticket);
  }

  ngOnDestroy() {
    this.ticket$.unsubscribe();
  }
    
  openPingModal(){

  }

  openLogModal(){

  }

  openCommentsModal(){
    if (!this.commentsRef) {
      const factory = this.factoryResolver.resolveComponentFactory(CommentsComponent);
      this.commentsRef = this.viewContRef.createComponent(factory);
      (<CommentsComponent>this.commentsRef.instance).key = this.ticket.key;
    }

    (<CommentsComponent>this.commentsRef.instance).modal.openModal();
  }

  openAdditionalDetails(){

    if (!this.branchInfoRef) {
      const factory = this.factoryResolver.resolveComponentFactory(TicketDetailsComponent);
      this.branchInfoRef = this.viewContRef.createComponent(factory);
      (<TicketDetailsComponent>this.branchInfoRef.instance).key = this.ticket.key;
    }

    (<TicketDetailsComponent>this.branchInfoRef.instance).openModal();
  }

}
