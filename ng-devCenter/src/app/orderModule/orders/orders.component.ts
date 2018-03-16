import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Observable, Subscription } from 'rxjs';

import { OrderService, UserService } from '@services';

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
	baseUrl = `${this.user.emberUrl}:${this.user.emberPort}/UD-ember/${this.user.emberLocal}order/ethernet`


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

	constructor(public order:OrderService, public user: UserService) { }

	/**
	 * on component init get all orders
	 */
	ngOnInit() {
		this.getOrders();
	}

	/**
	 * gets a list of orders.
	 */
	getOrders(){
		this.order.getOrders().subscribe(
			this.formatTableData.bind(this),
			this.order.processErrorResponse.bind(this.order)
		);
	}

	
	/**
	 *
	  @param {} response 
	 */
	formatTableData(response){
		

		let displayNames = response.display_names;
		let extraOrders = response.extra_data.map(order => {
			let formattedOrder = {};

			for(let key in order){
				let match = displayNames.find(dn => {
					return dn.table_name && dn.table_name[1] === key;
				});

				if(match) {
					const value = order[key] || '';
					delete order[key];
					formattedOrder[match.field_name] = value.toString().trim();
				}
			}

			console.log('order: ', order);
			formattedOrder = {...formattedOrder, ...order};

			return formattedOrder;
		});

		extraOrders = extraOrders.filter(order => order.Core_OrdNum);
		let originalOrders = response.data.filter(order => order.Core_OrdNum);

		originalOrders = originalOrders.filter((thing, index, self) =>
			index === self.findIndex((t) => (
				t.Core_OrdNum === thing.Core_OrdNum
			))
		)

		extraOrders = extraOrders.filter((thing, index, self) =>
			index === self.findIndex((t) => (
				t.Core_OrdNum === thing.Core_OrdNum
			))
		)

		this.orders = [...extraOrders, ...originalOrders];
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
