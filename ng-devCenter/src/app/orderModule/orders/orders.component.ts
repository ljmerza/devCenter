import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
export class OrdersComponent implements OnInit {
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

		this.getAtxIds(orders);

		return new_orders;
	}

	/**
	 *
	 */
	getAtxIds(orders){
		let atxIds = [];

		atxIds.push('AsedbSiteId:');
		orders.forEach(order => {

			if(order.ATX && order.ATX[0] && order.ATX[0].atx && order.ATX[0].atx.AsedbSiteId){
				atxIds.push(order.ATX[0].atx.AsedbSiteId);
			}
		});

		atxIds.push('AtxUniPon:');
		orders.forEach(order => {
			if(order.ATX && order.ATX[0] && order.ATX[0].atx && order.ATX[0].atx.AtxUniPon){
				atxIds.push(order.ATX[0].atx.AtxUniPon);
			}
		});

		atxIds.push('AtxUniUso:');
		orders.forEach(order => {
			if(order.ATX && order.ATX[0] && order.ATX[0].atx && order.ATX[0].atx.AtxUniUso){
				atxIds.push(order.ATX[0].atx.AtxUniUso);
			}
		});

		atxIds.push('AtxUniUsoIcoreId:');
		orders.forEach(order => {
			if(order.ATX && order.ATX[0] && order.ATX[0].atx && order.ATX[0].atx.AtxUniUsoIcoreId){
				atxIds.push(order.ATX[0].atx.AtxUniUsoIcoreId);
			}
		});
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
