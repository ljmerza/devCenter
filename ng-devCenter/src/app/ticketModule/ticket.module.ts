import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MomentModule } from 'angular2-moment';

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

// pipes
import { WorkTimePipe } from './work-time.pipe';


@NgModule({
	imports: [
		CommonModule, SharedModule.forRoot(), NgbModule.forRoot(),
		RouterModule, FormsModule, ReactiveFormsModule, MomentModule
	],
	declarations: [
		SetPingsComponent, TicketDetailsComponent, QaGeneratorComponent, WorkTimePipe,
		TicketLogComponent, TicketStatusComponent, StatusModalComponent, TicketComponent
	],
	exports: [TicketComponent]
})
export class TicketModule {}