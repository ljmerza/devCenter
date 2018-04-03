import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Observable, Subscription } from 'rxjs';

import { OrderService, UserService } from '@services';

@Component({
	selector: 'dev-center-edit-orders',
	templateUrl: './edit-orders.component.html',
	styleUrls: ['./edit-orders.component.scss']
})
export class EditOrdersComponent implements OnInit {
	loadingIndicator = true;
	tableTitle = 'Edit Orders';
	navbarItems;

	dtTrigger:Subject<any> = new Subject();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;

	dtOptions = {
		dom: `
			<'row'<'col-sm-12'Bfl>>
			<'row'<'col-sm-12'tr>>
			<'row'<'col-sm-12'ip>>
		`,
		pageLength: 15,
		lengthMenu: [5, 10, 15, 20, 100],
		buttons: ['colvis', 'excel'],
		stateSave: true,
		pagingType: 'full',
		language: {
			search: "",
        	searchPlaceholder: "Search Order",
        	zeroRecords: 'No matching orders found'
        }
	};

	constructor(public user: UserService) { }

	ngOnInit() {
		this.getEditableOrders();
	}

	/**
	 *
	 */
	getEditableOrders(){
		this.user.getNavbarItems().subscribe(
			this.formatTableData.bind(this),
			this.user.processErrorResponse.bind(this.user)
		);
	}

	/**
	 *
	 */
	formatTableData(navbarItems){
		this.navbarItems = navbarItems.data.map(item => {
			item.isNotEditingLink = true;
			item.isNotEditingName = true;
			item.isNotEditingType = true;
			return item;
		});

		this.loadingIndicator = false;
		this.rerender();
	}

	/**
	 *
	 */
	editItem(item, editingType){
		item[editingType] = !item[editingType];
	}

	/**
	 *
	 */
	saveItem(item, editingType){
		item[editingType] = !item[editingType];
		console.log('item, editingType: ', item, editingType);
	}

	/**
	 * render the data-table. If instance of data-table already exists then
	 * destroy it first then render it
	 */
	private rerender():void {
		if(this.dtElement && this.dtElement.dtInstance){
			this.dtElement.dtInstance.then( (dtInstance:DataTables.Api) => {
				dtInstance.destroy();
				this.dtTrigger.next();
			});
		} else {
			this.dtTrigger.next();
		}
	}

}
