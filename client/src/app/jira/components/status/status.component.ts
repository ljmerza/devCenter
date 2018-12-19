import {
  Component, Input, OnDestroy, OnInit, ViewChild, 
  ViewEncapsulation, ComponentFactoryResolver, ViewContainerRef 
} from '@angular/core';

import { Store, select } from '@ngrx/store';
import { Subscription, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';

import { selectAllStatuses, StatusesModel } from '@app/nav-bar';
import { selectProfile } from '@app/core/profile';
import { PanelComponent } from '@app/panel';

import { selectStatuses } from '../../selectors';
import { ActionStatusSave } from '../../actions';
import { StatusTicket, StatusState } from '../../models';
import { QaGeneratorComponent } from '../qa-generator/qa-generator.component';

@Component({
  selector: 'dc-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  host: { 'class': 'dc-status' },
  encapsulation: ViewEncapsulation.None,
  entryComponents: [QaGeneratorComponent]
})
export class StatusComponent implements OnDestroy, OnInit {
  profile$: Subscription;
  profile;

  qaCancel$: Subscription;

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

  showBranchInfo;
  qaGeneratorRef;


  @Input() key: string = '';
  @ViewChild(PanelComponent) modal: PanelComponent;

  constructor(public store: Store<{}>, private factoryResolver: ComponentFactoryResolver, private viewContRef: ViewContainerRef) { }

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
    this.profile$ && this.profile$.unsubscribe();
    this.statuses$ && this.statuses$.unsubscribe();
    this.qaCancel$ && this.qaCancel$.unsubscribe();
  }

  /**
   * 
   */
  processNewStatus([ticket, statuses]: [StatusTicket, StatusesModel[]]){
    if (!ticket) return;

    this.ticket = ticket;
    this.statuses = statuses;
    
    // get matching status object - fall back on component so we at least also show something
    const status: string = ticket.status || ticket.component;
    const matchingStatus: StatusesModel = { ...this.statuses.find(allStatus => allStatus.status_name === status) };
    
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
    if (event.value === 'pcrNeeded' && this.changedStatusCode !== 'pcrWorking') return this.openQaGenerator();

    const matchingStatus: StatusesModel = this.statuses.find(allStatus => allStatus.status_code === event.value);
    if (matchingStatus) this.changedStatusName = matchingStatus.status_name || '';

    this.showBranchInfo = this.changedStatusCode === 'uctReady';
    this.modal.openModal();
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
      pullRequests: this.ticket.pullRequests,
      addCommits: this.changedStatusCode === 'uctReady',
      masterBranch: this.ticket.repoName
    }));
  }

  /**
   * reset the selected status and close the confirm modal
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
    if (!this.qaGeneratorRef) {
      const factory = this.factoryResolver.resolveComponentFactory(QaGeneratorComponent);
      this.qaGeneratorRef = this.viewContRef.createComponent(factory);
      (<QaGeneratorComponent>this.qaGeneratorRef.instance).ticket = this.ticket;
      (<QaGeneratorComponent>this.qaGeneratorRef.instance).profile = this.profile;
      this.qaCancel$ = (<QaGeneratorComponent>this.qaGeneratorRef.instance).cancel
        .subscribe(() => this.confirmCancelStatus());
    }

    (<QaGeneratorComponent>this.qaGeneratorRef.instance).openModal();
  }

}
