import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MomentModule } from 'angular2-moment';
import { DataTablesModule } from 'angular-datatables';

// custom modules
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

// components
import { 
	SetPingsComponent, TicketDetailsComponent, QaGeneratorComponent, TicketLogComponent, 
	TicketStatusComponent, TicketComponent, TicketsComponent, CrucibleComponent 
} from './';

// pipes
import { WorkTimePipe } from './work-time.pipe';
import { UserDetailsComponent } from './user-details/user-details.component';
import { DatesComponent } from './dates/dates.component';
import { WatchersComponent } from './watchers/watchers.component';

@NgModule({
	imports: [
		CommonModule, SharedModule, NgbModule, DataTablesModule,
		RouterModule, FormsModule, ReactiveFormsModule, MomentModule,
	],
	declarations: [
		SetPingsComponent, TicketDetailsComponent, QaGeneratorComponent, CrucibleComponent,
		TicketLogComponent, TicketStatusComponent, DatesComponent,
		TicketsComponent, TicketComponent, WorkTimePipe, UserDetailsComponent, WatchersComponent
	],
	exports: [TicketsComponent]
})
export class TicketModule {}