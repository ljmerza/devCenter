import { Component, ChangeDetectionStrategy, Input, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { MatSort, MatTableDataSource, MatPaginator } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Store, select } from '@ngrx/store';
import { distinctUntilChanged } from 'rxjs/operators';

import { ActionTicketsRetrieve } from '../../actions';
import { selectJiraState, selectJiraLoading, selectJiraTickets } from '../../selectors';

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

  constructor(private route: ActivatedRoute, public store: Store<{}>) { }

  currentJql:string = '';
  displayedColumns: string[] = ['key', 'msrp', 'actions', 'summary','status','StartDate','DueDate','Estimate','Logged', 'Last Update','Created','Pull Requests','Assignee','Customer'];
  dataSource: MatTableDataSource<any>;

  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any;
  env = env

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  tickets$;
  loading$;
  filteredTickets;
  loading: boolean = false;
  loadingIcon:boolean = false;
  tableTitle = '';
  ticketType = '';

  ngOnInit():void {

    this.tickets$ = this.store.pipe(
        select(selectJiraState),
        distinctUntilChanged((prev, next) => {
          return prev.loading === next.loading &&
          prev.ticketType === next.ticketType &&
          prev.tickets === next.tickets;
        })
      )
      .subscribe(state => this.processTickets(state));

    this.loading$ = this.store.pipe(select(selectJiraLoading))
      .subscribe(loading => this.setLoading(loading));

    this.route.url.subscribe((urlSegment:UrlSegment[]) => {
      this.currentJql = urlSegment[0].parameters.jql || 'assignee = currentUser() AND resolution = Unresolved ORDER BY due DESC';
      this.ticketType = urlSegment[0].path || 'myopen';
      this.tableTitle = `${urlSegment[0].parameters.displayName || 'My Open'} Tickets`;
      this.getTickets();
    });

	}

  ngOnDestroy(): void {
    this.tickets$.unsubscribe();
    this.loading$.unsubscribe();
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

  cancelGetTickets(){

  }

  /**
   *
   */
  processTickets(state) {
    
    // find only matching tickets and then format them for expanded view
    this.filteredTickets = state.tickets.filter(ticket => ticket.ticketType === state.ticketType);
    const formattedTickets = this.formatTicketsForExpanded(this.filteredTickets);

    // create material table array
    this.dataSource = new MatTableDataSource(formattedTickets);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.setLoading(state.loading);
    this.loadingIcon = false;
  }

  /**
   *
   */
  setLoading(loading){
    this.loading = this.filteredTickets.length === 0 && loading;
  }

  /**
   *
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   *
   */
  trackTableBy(index, ticket){
    return ticket.key;
  }

  /**
   *
   */
  formatTicketsForExpanded(tickets): Array<any>{
    const rows = [];
    tickets.forEach(element => rows.push(element, { detailRow: true, element }));
    return tickets;
  }

}
