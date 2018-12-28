import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { Sort, MatTableDataSource, MatPaginator } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Store, select } from '@ngrx/store';
import { distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { ActionTicketsRetrieve, ActionTicketsCancel } from '../../actions';
import { selectJiraLoading, selectTickets } from '../../selectors';
import { JiraTicket } from '../../models';
import { TicketsEffects } from '../../effects';

import { selectSettings } from '@app/settings/settings.selectors';
import { ColumnDefinition } from '@app/settings/settings.model';
import { ActionSettingsPersist } from '@app/settings/settings.actions';

import { environment as env } from '@env/environment';

@Component({
  selector: 'dc-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TicketsComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute, public store: Store<{}>, private ticketEffects: TicketsEffects) { }

  currentJql:string = '';
  columnDefinitions: ColumnDefinition[] = [];

  dataSource: MatTableDataSource<any>;

  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  env = env;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  tickets$: Subscription;
  loading$: Subscription;
  settings$: Subscription;
  settings: any;

  filteredTickets: Array<JiraTicket> = [];
  loading: boolean = false;
  loadingIcon:boolean = false;
  tableTitle: string = '';
  ticketType: string = '';

  filterValue:string = '';
  currentPage: number = 0;

  ngOnInit():void {

    // watch for ticket column changes
    this.settings$ = this.store.pipe(
      select(selectSettings),
      distinctUntilChanged((prev, next) => prev.ticketColumnDefinitions === next.ticketColumnDefinitions)
    )
    .subscribe(state => this.settings = state);

    // watch for ticket changes from store
    this.tickets$ = this.store.pipe(
      select(selectTickets),
      distinctUntilChanged((prev, next) => prev.ticketType === next.ticketType && prev.tickets === next.tickets)
    )
    .subscribe(state => this.processTickets(state));
    
    // watch for laoding changes from store
    this.loading$ = this.store.pipe(select(selectJiraLoading))
      .subscribe(loading => this.setLoading(loading));
    
    // watch for route cahnges to fetch a different ticket list
    this.route.url.subscribe((urlSegment:UrlSegment[]) => {
      this.currentJql = urlSegment[0].parameters.jql || 'assignee = currentUser() AND resolution = Unresolved ORDER BY due DESC';
      this.ticketType = urlSegment[0].path || 'myopen';
      this.tableTitle = `${urlSegment[0].parameters.displayName || 'My Open'} Tickets`;

      this.resetTable();
      this.getTickets();
    });

	}

  ngOnDestroy(): void {
    this.tickets$.unsubscribe();
    this.loading$.unsubscribe();
    this.settings$.unsubscribe();
  }

  get displayedColumns(): string[] {
    return (this.ticketColumnDefinitions || []).filter(cd => cd.display).map(cd => cd.name);
  }

  set displayedColumns(value){
    console.log({value});
  }

  get ticketColumnDefinitions(){
    return ((this.settings || {}).ticketColumnDefinitions || []);
  }

  /**
   * change the user settings for which columns show on the ticket table
   * @param {string} value array of columns to show 
   */
  changeShown({value}){
    const newColumnDefinitions = this.ticketColumnDefinitions.map(cd => {
      cd = {...cd}
      cd.display = value.includes(cd.name);
      return cd;
    });

    this.store.dispatch(new ActionSettingsPersist({ ...this.settings, ticketColumnDefinitions: newColumnDefinitions}));
  }

  /**
   * set loading indicator based on if we have tickets already 
   * (refreshing list) or getting new ticket list
   * @param {boolean} loading 
   */
  setLoading(loading) {
    this.loadingIcon = loading;
    this.loading = this.filteredTickets.length === 0 && loading;
  }

  /**
   * fetch the list of thickets given the jql we current have
   */
  getTickets(){
    this.store.dispatch(new ActionTicketsRetrieve({
      currentJql:this.currentJql, 
      fields: '', 
      ticketType: this.ticketType
    }));

    this.loadingIcon = true;
  }

  /**
   * cancels the current request to get tickets
   */
  cancelGetTickets(){
    this.loading = false;
    this.ticketEffects.cancelSearchJiraTicket();
  }

  /**
   * reset the mat table values
   */
  resetTable(){
    // reset filter if has value
    if(this.dataSource) this.dataSource.filter = '';
    this.filterValue = ''

    // reset paginator
    this.paginator.pageIndex = 0;
  }

  /**
   * processes any new ticket lists into the UI
   * @param state 
   */
  processTickets(state) {
    // find only matching ticketType tickets
    this.filteredTickets = state.tickets.filter(ticket => ticket.ticketType === state.ticketType);

    // create sorted material table array
    this.sortData({ active: 'Start Date', direction: 'asc' }, this.filteredTickets);
  }

  /**
   * table filtering function 
   * @param filterValue 
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
  * track by function for table
  * @param index 
  * @param ticket 
  */
  trackTableBy(index, ticket){
    return ticket.key;
  }

  /**
   * adds sort functionality
   * @param sort 
   */
  sortData(sort: Sort, data:any='') {
    data = data || this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') return;

    data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';

      switch (sort.active) {
        case 'Key': return this.compare(a.key, b.key, isAsc);
        case 'MSRP': return this.compare(a.msrp, b.msrp, isAsc);
        case 'Summary': return this.compare(a.summary, b.summary, isAsc);
        case 'Status': return this.compare(a.status, b.status, isAsc);
        case 'Start Date': return this.compare(a.dates.started, b.dates.started, isAsc);
        case 'Due Date': return this.compare(a.dates.duedate, b.dates.duedate, isAsc);
        case 'Estimate': return this.compare(a.dates.estimate_seconds, b.dates.estimate_seconds, isAsc);
        case 'Logged': return this.compare(a.dates.logged_seconds, b.dates.logged_seconds, isAsc);
        case 'Pull Requests': return this.pullCompare(a.pullRequests || [], b.pullRequests || [], isAsc);
        case 'Assignee': return this.compare(a.username, b.username, isAsc);
        case 'Customer': return this.compare(a.customer_details.username, b.customer_details.username, isAsc);
        default: return 0;
      }
    });
    
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
  }

  /**
   * basic comparitor for sorting
   * @param a 
   * @param b 
   * @param isAsc 
   */
  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  /**
   * wrapper around compare to sort pull requests
   * @param a 
   * @param b 
   * @param isAsc 
   */
  pullCompare(a, b, isAsc){
    a = a.map(a_ => a_.repoName).join('');
    b = b.map(b_ => b_.repoName).join('');
    return this.compare(a, b, isAsc);
  }
}
