import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription, combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { selectAllStatuses, selectProfile } from '@app/nav-bar/selectors';
import { selectStatusesTickets } from '../../selectors';
import { ActionStatusSave } from '../../actions';
import { StatusTicket } from '../../models';

import { PanelComponent } from '@app/panel/components/panel/panel.component';

@Component({
  selector: 'dc-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  host: { 'class': 'dc-status' },
  encapsulation: ViewEncapsulation.None
})
export class StatusComponent implements OnDestroy, OnInit {
  profile$: Subscription;
  profile;

  statuses$: Subscription;
  statuses;
  ticket:any = {};

  // keep track of valid transitions, the original values, and the values the user changed to
  transitions:any = [];
  originalStatusCode: string = '';
  originalStatusName: string = '';
  changedStatusCode: string = '';
  changedStatusName: string = '';
  borderColor: string = '';

  // matching string to show branch info
  branchInfoMatcherCode: string = '';

  @Input() key: string = '';
  @ViewChild(PanelComponent) modal: PanelComponent;

  constructor(public store: Store<{}>) { }

  ngOnInit() {
    this.profile$ = this.store.pipe(select(selectProfile))
      .subscribe(profile => this.profile = profile);

    this.statuses$ = combineLatest(
      this.store.pipe(
        select(selectStatusesTickets), 
        map((tickets: StatusTicket[]) => tickets.find(ticket => ticket.key === this.key)), 
        distinctUntilChanged()
      ),
      this.store.pipe(select(selectAllStatuses), distinctUntilChanged())
    )
      .subscribe(this.processNewStatus.bind(this));
  }

  ngOnDestroy() {
    this.profile$.unsubscribe();
    this.statuses$.unsubscribe();
  }

  /**
   * 
   */
  processNewStatus([ticket = [], statuses = []]){
    this.ticket = ticket;
    this.statuses = statuses;
    this.branchInfoMatcherCode = (statuses.find(status => status.constant === 'UCTREADY') || {}).status_code || '';

    // get matching status object
    const matchingStatus = { ...(this.statuses.find(allStatus => allStatus.status_name === this.ticket.status) || {}) };

    // reset all status values
    this.originalStatusCode = matchingStatus.status_code || '';
    this.originalStatusName = matchingStatus.status_name || '';
    this.changedStatusCode = matchingStatus.status_code || '';
    this.changedStatusName = matchingStatus.status_name || '';
    this.borderColor = matchingStatus.color ? `solid 2px ${matchingStatus.color}` : '';

    // reset transitions and add current status to top
    this.transitions = Array.from(matchingStatus.transitions || []);
    this.transitions.unshift({ status_code: this.originalStatusCode, status_name: this.originalStatusName });
  }

  /**
   * opens QA generator or status cahnge confirm dialog
   * @param event 
   */
  changeStatus(event){
    this.changedStatusCode = event.value;
    this.changedStatusName = (this.statuses.find(allStatus => allStatus.status_code === event.value) || {}).status_name || '';

    if (event.value === 'pcrNeeded') return this.openQaGenerator();
    else this.modal.openModal();
  }

  /**
   * 
   */
  confirmChangeStatus(){
    this.originalStatusCode = this.changedStatusCode;
    this.originalStatusName = this.changedStatusName;
    this.modal.closeModal();

    this.store.dispatch(new ActionStatusSave({ 
      username: this.profile.name, 
      key: this.ticket.key, 
      statusType: this.changedStatusCode,
      repoName: this.ticket.repoName,
      pullRequests: this.ticket.pullRequests
    }));
  }

  /**
   * 
   */
  confirmCancelStatus(){
    this.changedStatusCode = this.originalStatusCode;
    this.changedStatusName = this.originalStatusName;
    this.modal.closeModal();
  }

  /**
   * opens the QA generator
   */
  openQaGenerator(){

  }

}
