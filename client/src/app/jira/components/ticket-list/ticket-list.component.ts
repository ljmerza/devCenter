import { Component, ChangeDetectionStrategy, Input, ViewChild, OnInit } from '@angular/core';
import { MatSort, MatTableDataSource, MatPaginator } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { Observable, of } from 'rxjs';

@Component({
  selector: 'dc-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TicketListComponent implements OnInit {
  displayedColumns: string[] = ['key', 'msrp', 'actions', 'summary','status','StartDate','DueDate','Estimate','Logged', 'Last Update','Created','Pull Requests','Assignee','Customer'];
  dataSource: MatTableDataSource<any>;

  constructor() { }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() tickets: Array<any>;

  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any;

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.formatTicketsForExpanded(this.tickets));
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  trackTableBy(index, ticket){
    return ticket.key;
  }

  formatTicketsForExpanded(tickets): Array<any>{
    const rows = [];
    tickets.forEach(element => rows.push(element, { detailRow: true, element }));
    return rows;

  }
}
