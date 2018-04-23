import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { NgProgress } from 'ngx-progressbar';
import { Subject } from 'rxjs';

import { select, NgRedux } from '@angular-redux/store';
import { RootState, Actions } from '@store';
import { OrderService, UserService, MiscService } from '@services';

@Component({
	selector: 'dev-center-orders',
	templateUrl: './orders.component.html',
	styleUrls: ['./orders.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class OrdersComponent implements OnInit, AfterViewInit {
	orders:Array<any> = [];
	displayNames = [];
	loadingIndicator = true;
	tableTitle = 'Orders';
	getOrders$;
	orders$;

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

	constructor(
		public order:OrderService, public user:UserService, public misc:MiscService, 
		private store:NgRedux<RootState>, public ngProgress: NgProgress) { }

	/**
	 * on component init get all orders
	 */
	ngOnInit() {
		this.getOrders();

		this.orders$ = this.store.select('orders')
		.subscribe(orders => this.processOrders(orders));
	}

	ngAfterViewInit(): void {
    	this.dtTrigger.next();
	}

	ngOnDestroy(): void {
    	if(this.orders$) this.orders$.unsubscribe();
	}

	/**
	 * gets a list of orders.
	 */
	getOrders(hardRefresh=false){
		this.resetLoading();
		this.ngProgress.start();

		this.getOrders$ = this.order.getOrders(hardRefresh)
		.subscribe(
			response => {
				this.store.dispatch({type: Actions.newOrders, payload: response.data});
			},
			this.order.processErrorResponse.bind(this.order)
		);
	}

	/**
	 * set orders and reset data table
	 * @param {Array<Object>} orders 
	 */
	processOrders(orders){
		if(orders.length === 0) {
			this.loadingIndicator = true;
			return;
		}

		// save orders. if we have orders then cancel API call
		this.orders = orders;
		this.loadingIndicator = false;
		this.resetLoading();

		this.dtElement && this.dtElement.dtInstance && this.dtElement.dtInstance.then((dtInstance:DataTables.Api) => {
			dtInstance.destroy();
			this.dtTrigger.next();
		});
	}

	trackByFn(index: number, order){
		return order.OrdNum;
	}

	/**
	 *
	 */
	private resetLoading(){
		if(this.ngProgress) this.ngProgress.done();
		if(this.getOrders$) this.getOrders$.unsubscribe();
	}
}
