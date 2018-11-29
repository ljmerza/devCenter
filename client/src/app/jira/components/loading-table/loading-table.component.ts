import { Component, Output, Input, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'dc-loading-table',
  templateUrl: './loading-table.component.html',
  styleUrls: ['./loading-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingTableComponent {
	@Output() refreshData = new EventEmitter();
	@Output() stopRefresh = new EventEmitter();
	@Input() loadingTable: boolean = false;
	@Input() loadingIcon: boolean = false;
	@Input() tableTitle: string = '';

	constructor() { }
}
