import { Component, Output, Input, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
	selector: 'dc-loading-table',
	templateUrl: './loading-table.component.html',
	styleUrls: ['./loading-table.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class LoadingTableComponent {
	@Output() refreshData = new EventEmitter();
	@Input() loadingTable;
	@Input() tableTitle;

	constructor() { }

	/**
	 * send refresh notification
	 */
	refreshDataEvent(){
		this.refreshData.emit();
	}
}
