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

		// filter duplicate orders
		orders = (orders || []).filter((thing, index, self) =>
			index === self.findIndex((t) => (
				t.OrdNum === thing.OrdNum
			))
		);

		console.log('orders: ', orders[0]);

		orders = orders.map(order => {
			// trim order numbers
			order.OrdNum = order.OrdNum.trim();
			order.trk = order.trk.trim();
			order.RO = order.RO.trim();

			// show example order for debugging
			// if(order.OrdNum === 'C5CKTB67') console.log('order: ', order);

			// parse EVC data
			let evcData = (order.EVC_Status || '').split('</br>');
			if(evcData.length > 3){
				order.evcCircuit = evcData[0].substring(4);
				order.evcAsr = evcData[2].substring(9);
				order.evcType = evcData[3].substring(6);
			}

			// encode circuits for URLs
			if(order.FORCE_enocDSP__CIRCUIT_ID){
				order.FORCE_enocDSP__CIRCUIT_ID = order.FORCE_enocDSP__CIRCUIT_ID.trim();
				order.circuit_cnl = encodeURIComponent(order.FORCE_enocDSP__CIRCUIT_ID);
			}
			if(order.cktid){
				order.cktid = order.cktid.trim();
				order.circuit_uni = encodeURIComponent(order.cktid);
			}
			if(order.evcCircuit){
				order.evcCircuit = order.evcCircuit.trim();
				order.circuit_evc = encodeURIComponent(order.evcCircuit);
			}

			return order;
		});

		this.orders = orders;
		this.rerender();
		this.loadingIndicator = false;
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
