import { Component, OnInit, ViewChild, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Observable, Subscription } from 'rxjs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ModalComponent } from '@modal';
import { ItemsService, ToastrService } from '@services';

@Component({
	selector: 'dev-center-edit-orders',
	templateUrl: './edit-orders.component.html',
	styleUrls: ['./edit-orders.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditOrdersComponent implements OnInit {
	loadingIndicator:boolean = true;
	tableTitle:string = 'Edit Orders';
	navbarItems: Array<any>;
	dropdownItems: Array<string> = [];
	modalRef:NgbModalRef;

	dtTrigger:Subject<any> = new Subject();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild(ModalComponent) modal: ModalComponent;

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

	constructor(public items: ItemsService, private toastr: ToastrService) { }

	ngOnInit() {
		this.getEditableItems();
	}

	/**
	 *
	 */
	getEditableItems(){
		this.items.getItems().subscribe(
			this.formatTableData.bind(this),
			this.items.processErrorResponse.bind(this.items)
		);
	}

	/**
	 * gets all dropdown options and sets editing booleans on each item
	 * @param {Array<Object>} array of items to show
	 */
	formatTableData(items){
		this.navbarItems = items.data
		.filter(item => !['dev_links','ember_links','teamdb_ember', 'prod_links', 'beta_links'].includes(item.type))
		.map(item => {
			item.isNotEditing = true;

			// save values for comparing when saving
			item.nameOld = item.name;
			item.linkOld = item.link;
			item.typeOld = item.type;
			return item;
		});

		this.navbarItems.forEach(item => {
			if(!this.dropdownItems.includes(item.type)) {
				this.dropdownItems.push(item.type);
			}
		});

		this.loadingIndicator = false;
		this.rerender();
	}

	/**
	 * sets an item to is editing
	 * @param {Object} item
	 * @param {string} editingName
	 */
	editItem(item, editingName){
		item.isNotEditing = false;
	}

	/**
	 * toggles an editing boolean for an item
	 * @param {Object} item
	 * @param {string} editingName
	 */
	saveItem(item, editingName){
		item.isNotEditing = true;

		// if no changes then dont save
		if(item.nameOld === item.name || item.linkOld === item.link || item.typeOld === item.type){
			this.toastr.showToast(`No changes made to ${item.name}.`, 'info');
			return;
		}

		this.items.setItem(item).subscribe(
			response => this.toastr.showToast(response.data, 'success'),				
			error => {
				// show error and reset values
				this.items.processErrorResponse(error);
				item.name = item.nameOld;
				item.link = item.linkOld;
				item.type = item.typeOld;
			}
		);
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

	/**
	 *
	 */
	trackByFn(index: number, item){
		return item.id;
	}

	/**
	 *
	 */
	closeModal(){
		this.modalRef.close();
	}

	/**
	 *
	 */
	openModal(){
		this.modalRef = this.modal.openModal();
	}

}
