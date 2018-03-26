import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { NgProgressModule } from 'ngx-progressbar';

import { OrdersComponent } from './orders/orders.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	imports: [CommonModule, DataTablesModule, NgProgressModule, SharedModule],
	declarations: [OrdersComponent]
})
export class OrderModule { }
