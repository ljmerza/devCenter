import { Component, Output, Input, EventEmitter, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'dc-loading-table',
  templateUrl: './loading-table.component.html',
  styleUrls: ['./loading-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingTableComponent {
	@Output() refreshData = new EventEmitter();
	@Output() stopRefresh = new EventEmitter();
	@Input() loadingTable;
	@Input() loadingIcon;
	@Input() tableTitle;

	constructor() { }

	/**
	 * send refresh notification
	 */
	refreshDataEvent(){
		this.refreshData.emit();
	}

	/**
	 * send stop refresh notification
	 */
	stopRefreshDataEvent(){
		this.stopRefresh.emit();
	}
}
