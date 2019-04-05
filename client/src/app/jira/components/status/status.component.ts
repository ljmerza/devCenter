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
import { ActionStatusSave, ActionCommentSave } from '../../actions';
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
  transitions: String[] = [];

  currentStatus = '';
  originalStatus = '';

  borderColor = '';
  loading = false;
  privateComment = true;

  showBranchInfo = false;
  showUatNotReady = false;

  uatNotReady = false;
  comment = '';

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

          // if error came back then reset status
          if(state.error) this.confirmCancelStatus();
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
   * get new ticket status and update UI dropdown
   */
  processNewStatus([ticket, statuses]: [StatusTicket, StatusesModel[]]){
    if (!ticket) return;
    this.statuses = statuses;
    this.ticket = ticket;

    this.originalStatus = ticket.component || ticket.status || '';
    this.currentStatus = this.originalStatus;
        
    // if we found a matching db status then get props from there
    const matchingDbStatus: StatusesModel = this.statuses.find(allStatus => allStatus.status_name === this.currentStatus);
    if (matchingDbStatus){
      this.borderColor = matchingDbStatus.color ? `solid 2px ${matchingDbStatus.color}` : '';
    } else {
      this.borderColor = '';
    }

    // get all transition names and add current status to top if its not there
    this.transitions = ticket.transitions.map(transition => transition.name);
    if (!this.transitions.includes(this.currentStatus)) this.transitions.unshift(this.currentStatus);
  }

  /**
   * opens QA generator or status cahnge confirm dialog
   * @param event 
   */
  changeStatus(event){
    this.currentStatus = event.value;

    if (['PCR Ready'].includes(this.currentStatus) && ['In Development'].includes(this.originalStatus)) {
      this.openQaGenerator();
      return;
    }

    // setup custom menus for dialog based on new state
    this.showUatNotReady = ['Remove Merge Code'].includes(this.currentStatus);
    this.showBranchInfo = ['Remove Merge Code', 'In Development'].includes(this.currentStatus);

    this.loading = true;
    this.modal.openModal();
  }

  /**
   * persists the status change for this ticket
   */
  confirmChangeStatus(){
    const validComponents = ['PCR - Needed', 'PCR - Working', 'Merge Conflict', 'Merge Code'];
    const validRemoveComponents = validComponents.map(component => `Remove ${component}`);

    this.modal.closeModal();
    const newStatus = this.ticket.transitions.find(transition => transition.name === this.currentStatus)
      || { id: '', name: this.currentStatus.replace(/^Remove /, '') };
    
    this.store.dispatch(new ActionStatusSave({ 
      username: this.profile.name, 
      key: this.ticket.key, 
      status: newStatus,
      originalStatus: this.originalStatus.replace(/^Remove /, ''),
      isAddingComponent: !!newStatus.id,
      isRemovingComponent: validRemoveComponents.includes(this.currentStatus) || validComponents.includes(this.originalStatus),
      repoName: this.ticket.repoName,
      pullRequests: this.ticket.pullRequests,
      addCommits: ['Remove Merge Code'].includes(this.currentStatus),
      masterBranch: this.ticket.repoName,
    }));

    // if comment or UAT not ready added then dispatch that now
    if (this.uatNotReady) {
      this.comment += `\n\n{color:red}UAT not ready as of ${new Date()}{color}`;
    }

    if (this.comment){
      this.store.dispatch(new ActionCommentSave({
        comment: this.comment,
        remove_conflict: false,
        log_time: 0,
        key: this.ticket.key,
        master_branch: '',
        private_comment: this.privateComment,
      }));

      
      this.resetInputs();
    }
  }

  /**
   * resets all inputs
   */
  resetInputs(){
    this.loading = false;
    this.comment = '';
    this.uatNotReady = false;
  }

  /**
   * reset the selected status and close the confirm modal
   */
  confirmCancelStatus(){
    this.currentStatus = this.originalStatus;
    this.resetInputs();
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
