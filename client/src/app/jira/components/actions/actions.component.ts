import { Component, Input, OnInit, OnDestroy, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { BranchInfoComponent } from '../branch-info/branch-info.component';


@Component({
  selector: 'dc-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'], 
  entryComponents: [BranchInfoComponent]
})
export class ActionsComponent implements OnInit, OnDestroy {
  ticket$: Subscription;
  ticket;

  branchInfoRef;

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

  }

  openAdditionalDetails(){
    if (!this.branchInfoRef) {
      const factory = this.factoryResolver.resolveComponentFactory(BranchInfoComponent);
      const component = this.viewContRef.createComponent(factory);
      (<BranchInfoComponent>this.branchInfoRef.instance).selectorTicket = this.ticket.selectorTicket;
      this.branchInfoRef = component;
    }

    (<BranchInfoComponent>this.branchInfoRef.instance).openModal();
  }

}
