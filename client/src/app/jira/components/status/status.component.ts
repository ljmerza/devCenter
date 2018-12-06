import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';

import { selectAllStatuses, selectProfile } from '@app/nav-bar/selectors';
import { selectStatuses } from '../../selectors';
import { ActionStatusSave } from '../../actions';
import { StatusTicket, StatusState } from '../../models';
import { StatusesModel } from '@app/nav-bar/models';

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
  statuses: StatusesModel[] = [];
  ticket: StatusTicket;

  // keep track of valid transitions, the original values, and the values the user changed to
  transitions: StatusesModel[] = [];
  originalStatusCode: string = '';
  originalStatusName: string = '';
  changedStatusCode: string = '';
  changedStatusName: string = '';
  borderColor: string = '';
  loading: boolean = false;

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
        select(selectStatuses), 
        tap(state => {
          if(this.loading) this.loading = state.loading;
        }),
        map((state: StatusState): StatusTicket => state.tickets.find(ticket => ticket.key === this.key)), 
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
  processNewStatus([ticket, statuses]: [StatusTicket, StatusesModel[]]){
    this.ticket = ticket;
    this.statuses = statuses;

    const matchiongStatus: StatusesModel = statuses.find(status => status.constant === 'UCTREADY');
    if (matchiongStatus) this.branchInfoMatcherCode = matchiongStatus.status_code || '';

    // get matching status object
    const matchingStatus:any = { ...(this.statuses.find(allStatus => allStatus.status_name === ticket.status) || {}) };
    
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

    const matchingStatus: StatusesModel = this.statuses.find(allStatus => allStatus.status_code === event.value);
    if (matchingStatus) this.changedStatusName = matchingStatus.status_name || '';

    if (event.value === 'pcrNeeded') return this.openQaGenerator();
    else this.modal.openModal();
  }

  /**
   * persists the status change for this ticket
   */
  confirmChangeStatus(){
    this.modal.closeModal();

    this.store.dispatch(new ActionStatusSave({ 
      username: this.profile.name, 
      key: this.ticket.key, 
      statusType: this.changedStatusCode,
      status: this.changedStatusName,
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
