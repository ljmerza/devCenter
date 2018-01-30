import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MomentModule } from 'angular2-moment';
import { NgProgressModule } from 'ngx-progressbar';
import { DataTablesModule } from 'angular-datatables';

// custom modules
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

// components
import { SetPingsComponent } from './set-pings/set-pings.component';
import { TicketDetailsComponent } from './ticket-details/ticket-details.component';
import { QaGeneratorComponent } from './qa-generator/qa-generator.component';
import { TicketLogComponent } from './ticket-log/ticket-log.component';
import { StatusModalComponent } from './status-modal/status-modal.component';
import { TicketStatusComponent } from './ticket-status/ticket-status.component';
import { TicketComponent } from './ticket/ticket.component';
import { TicketsComponent } from './tickets/tickets.component';

// pipes
import { WorkTimePipe } from './work-time.pipe';
// directives
import { TicketExpandDirective } from './ticket-expand.directive';

@NgModule({
	imports: [
		CommonModule, SharedModule, NgbModule,
		RouterModule, FormsModule, ReactiveFormsModule, MomentModule,
		NgProgressModule, DataTablesModule
	],
	declarations: [
		SetPingsComponent, TicketDetailsComponent, QaGeneratorComponent,
		TicketLogComponent, TicketStatusComponent, StatusModalComponent,
		TicketsComponent, TicketComponent, WorkTimePipe, TicketExpandDirective
	],
	exports: [TicketsComponent]
})
export class TicketModule {}