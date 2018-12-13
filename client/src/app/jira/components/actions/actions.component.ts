import { Component, Input, OnInit, OnDestroy, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { TicketDetailsComponent } from '../ticket-details/ticket-details.component';
import { CommentsComponent } from '../comments/comments.component';
import { BranchInfoComponent } from '../branch-info/branch-info.component';
import { AddLogComponent } from '../add-log/add-log.component';
import { selectTickets } from '../../selectors';
import { TicketsState } from '../../models';


@Component({
  selector: 'dc-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'], 
  entryComponents: [
    TicketDetailsComponent, CommentsComponent, 
    BranchInfoComponent, AddLogComponent
   ]
})
export class ActionsComponent implements OnInit, OnDestroy {
  ticket$: Subscription;
  ticket;

  branchInfoRef;
  commentsRef;
  detailsRef;
  logsRef;

  @Input() key;

  constructor(public store: Store<{}>, private factoryResolver: ComponentFactoryResolver, private viewContRef: ViewContainerRef) { }

  ngOnInit() {
    this.ticket$ = this.store.pipe(
        select(selectTickets),
        map((state: TicketsState) => state.tickets.find(ticket => ticket.key === this.key)),
      )
      .subscribe(ticket => this.ticket = ticket);
  }

  ngOnDestroy() {
    this.ticket$.unsubscribe();
  }
    
  openBranchModal(){
    if (!this.branchInfoRef) {
      const factory = this.factoryResolver.resolveComponentFactory(BranchInfoComponent);
      this.branchInfoRef = this.viewContRef.createComponent(factory);
      (<BranchInfoComponent>this.branchInfoRef.instance).sprint = this.ticket.sprint;
      (<BranchInfoComponent>this.branchInfoRef.instance).branch = this.ticket.branch;
      (<BranchInfoComponent>this.branchInfoRef.instance).commit = this.ticket.commit;
      (<BranchInfoComponent>this.branchInfoRef.instance).key = this.ticket.key;
      (<BranchInfoComponent>this.branchInfoRef.instance).epicLink = this.ticket.epic_link;
    }

    (<BranchInfoComponent>this.branchInfoRef.instance).modal.openModal();
  }

  openLogModal(){
    if (!this.logsRef) {
      const factory = this.factoryResolver.resolveComponentFactory(AddLogComponent);
      this.logsRef = this.viewContRef.createComponent(factory);
      (<AddLogComponent>this.logsRef.instance).ticket = this.ticket;
    }

    (<AddLogComponent>this.logsRef.instance).modal.openModal();
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
    if (!this.detailsRef) {
      const factory = this.factoryResolver.resolveComponentFactory(TicketDetailsComponent);
      this.detailsRef = this.viewContRef.createComponent(factory);
      (<TicketDetailsComponent>this.detailsRef.instance).key = this.ticket.key;
    }

    (<TicketDetailsComponent>this.detailsRef.instance).openModal();
  }

}
