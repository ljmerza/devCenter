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

		// filter duplicate orders
		let orders = (response.data || []).filter((thing, index, self) =>
			index === self.findIndex((t) => (
				t.OrdNum === thing.OrdNum
			))
		)

		// split up EVC data
		orders = orders.map(order => {
			order.OrdNum = order.OrdNum.trim();
			order.trk = order.trk.trim();

			let evcData = (order.EVC_Status || '').split('</br>');

			if(evcData.length > 3){
				order.evcCircuit = evcData[0].substring(4);
				order.evcAsr = evcData[2].substring(9);
				order.evcType = evcData[3].substring(6);
			}

			return order;
		})

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
