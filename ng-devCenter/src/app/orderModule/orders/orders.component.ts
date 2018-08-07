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
	ticketType:string = 'orders';
	
	tableTitle = 'Orders';
	getOrders$;
	orders$;

	baseEmber = `${this.user.emberUrlBase}:${this.user.emberPort}/UD-ember/${this.user.emberLocal}`;
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
		this.store.dispatch({type: Actions.ticketType, payload: this.ticketType });
		this.getOrders();

		this.orders$ = this.store.select(this.ticketType)
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
	async processOrders(orders){
		if(orders.length === 0) {
			this.loadingIndicator = true;
			return;
		}

		// save orders. if we have orders then cancel API call
		this.orders = this._format_orders(orders);
		this.loadingIndicator = false;
		this.resetLoading();

		let dtInstance = await this.dtElement.dtInstance
		if(dtInstance) {
			dtInstance.destroy();
			this.dtTrigger.next();
		}
	}

	/**
	 * adds data to each order before showing in the UI
	 * @param {Object} order the order itself
	 * @return {Object} the modified order object
	 */
	_format_orders(orders){
		const new_orders = orders.map(order => {
			order = this._add_po_to(order, 'UNI');
			order = this._add_po_to(order, 'CNL');
			order = this._add_po_to(order, 'EVC');
			return order;
		});

		return new_orders;
	}

	/**
	 * gets all PO/TO data for easy display
	 * @param {Object} order the order itself
	 * @param {string} component the component type to search for TO/PO data
	 * @return {Object} the modified order object
	 */
	_add_po_to(order, component){
		const component_pos = order[component] && 
			order[component][0].canopi_data && 
			order[component][0].canopi_data.po && 
			order[component][0].canopi_data.po.po_summary &&
			order[component][0].canopi_data.po.po_summary.OrderList;
		order[`${component}_pos`] =  (component_pos || []).map(po => `${po.orderType} ${po.orderId}`);

		const component_tos = order[component] && 
			order[component][0].canopi_data && 
			order[component][0].canopi_data.to && 
			order[component][0].canopi_data.to.to_summary &&
			order[component][0].canopi_data.to.to_summary.OrderList;
		order[`${component}_tos`] = (component_tos || []).map(to => `${to.orderType} ${to.orderId}`);

		return order;
	}

	/**
	 *
	 */
	trackByFn(index: number, order){
		return (order.CNL || order.UNI || order.EVC || order.ATX || order.ADE || [{}])[0].WfaClo;
	}

	/**
	 *
	 */
	private resetLoading(){
		if(this.ngProgress) this.ngProgress.done();
		if(this.getOrders$) this.getOrders$.unsubscribe();
	}
}
