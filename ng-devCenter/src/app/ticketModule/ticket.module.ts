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
import { CrucibleComponent } from './crucible/crucible.component';

// pipes
import { WorkTimePipe } from './work-time.pipe';
import { UserDetailsComponent } from './user-details/user-details.component';
import { DatesComponent } from './dates/dates.component';

@NgModule({
	imports: [
		CommonModule, SharedModule, NgbModule,
		RouterModule, FormsModule, ReactiveFormsModule, MomentModule,
		NgProgressModule, DataTablesModule
	],
	declarations: [
		SetPingsComponent, TicketDetailsComponent, QaGeneratorComponent,
		TicketLogComponent, TicketStatusComponent, StatusModalComponent,
		TicketsComponent, TicketComponent, WorkTimePipe, UserDetailsComponent, CrucibleComponent, DatesComponent
	],
	exports: [TicketsComponent]
})
export class TicketModule {}