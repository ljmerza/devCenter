import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { NgProgressModule } from 'ngx-progressbar';

import { OrdersComponent } from './orders/orders.component';

@NgModule({
	imports: [CommonModule, DataTablesModule, NgProgressModule],
	declarations: [OrdersComponent]
})
export class OrderModule { }
