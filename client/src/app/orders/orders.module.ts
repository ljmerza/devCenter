import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '@app/shared';
import { OrdersRoutingModule } from './orders-routing.module';

import { ApolloComponent } from './components';
import { ApolloService } from './services';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    
    OrdersRoutingModule, 
  ],
  providers: [ApolloService],
  declarations: [ApolloComponent]
})
export class OrdersModule { }
