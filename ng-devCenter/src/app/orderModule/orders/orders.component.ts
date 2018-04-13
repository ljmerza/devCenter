import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

import { OrderService, UserService, MiscService } from '@services';

@Component({
	selector: 'dev-center-orders',
	templateUrl: './orders.component.html',
	styleUrls: ['./orders.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class OrdersComponent implements OnInit {
	orders:Array<any> = [];
	displayNames = [];
	loadingIndicator = true;
	tableTitle = 'Orders';

	baseEmber = `${this.user.emberUrl}:${this.user.emberPort}/UD-ember/${this.user.emberLocal}`;
	baseUrl = `${this.baseEmber}order/ethernet`;
	aseBaseUrl = `${this.baseEmber}order/asedb`;
	circuitBaseUrl = `${this.baseEmber}asset/history?asset=`;

	dtTrigger:Subject<any> = new Subject();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;

	dtOptions = {
		dom: `
			<'row'<'col-sm-12'Bfl>>
			<'row'<'col-sm-12'tr>>
			<'row'<'col-sm-12'ip>>
		`,
		pageLength: 15,
		order: [[0, 'desc']],
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

	constructor(public order:OrderService, public user:UserService, public misc:MiscService) { }

	/**
	 * on component init get all orders
	 */
	ngOnInit() {
		this.getOrders();
	}

	/**
	 * gets a list of orders.
	 */
	getOrders(hardRefresh=false){
		this.order.getOrders(hardRefresh).subscribe(
			response => {
				if(!this.order.ordersCache || hardRefresh) this.order.ordersCache = response;
				this.formatTableData(response.data);
			},
			this.order.processErrorResponse.bind(this.order)
		);
	}

	/**
	 *
	 * @param {Array<Object>} orders 
	 */
	formatTableData(orders){
		// console.log('orders: ', orders);
		this.orders = orders;
		this.loadingIndicator = false;
		this.rerender();
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

	trackByFn(index: number, order){
		return order.OrdNum;
	}
}
