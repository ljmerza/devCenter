import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgProgressModule } from 'ngx-progressbar';

import { OrdersComponent } from './orders/orders.component';
import { EditOrdersComponent } from './edit-orders/edit-orders.component';

import { SharedModule } from '../shared/shared.module';

@NgModule({
	imports: [CommonModule, NgProgressModule, SharedModule, FormsModule],
	declarations: [OrdersComponent, EditOrdersComponent]
})
export class OrderModule { }
