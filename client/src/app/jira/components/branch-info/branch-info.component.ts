import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { ActionBranchInfoRetrieve } from '../../actions';
import { PanelComponent } from '@app/panel/components/panel/panel.component';


@Component({
  selector: 'dc-branch-info',
  templateUrl: './branch-info.component.html',
  styleUrls: ['./branch-info.component.css']
})
export class BranchInfoComponent implements OnInit, OnDestroy {
  ticket$: Subscription;
  ticket;

  @Input() selectorTicket;
  @ViewChild(PanelComponent) modal: PanelComponent;

  constructor(public store: Store<{}>) { }

  ngOnInit() {
    this.ticket$ = this.store.pipe(select(this.selectorTicket))
      .subscribe(ticket => this.ticket = ticket);
  }

  ngOnDestroy() {
    this.ticket$.unsubscribe();
  }

  openModal(){
    this.modal.openModal();
    this.store.dispatch(new ActionBranchInfoRetrieve(this.ticket.key));
  }

}
