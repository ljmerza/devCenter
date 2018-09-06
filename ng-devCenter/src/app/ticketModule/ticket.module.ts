import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MomentModule } from 'angular2-moment';
import { DataTablesModule } from 'angular-datatables';

// custom modules
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

// components
import { 
	SetPingsComponent, TicketDetailsComponent, QaGeneratorComponent, WorkLogComponent, 
	TicketStatusComponent, TicketComponent, TicketsComponent, CrucibleComponent 
} from './';

// pipes
import { WorkTimePipe } from './work-time.pipe';
import { DatesComponent } from './dates/dates.component';
import { WatchersComponent } from './watchers/watchers.component';
import { BranchInfoComponent } from './branch-info/branch-info.component';

@NgModule({
	imports: [
		CommonModule, SharedModule, NgbModule, DataTablesModule, NgxDatatableModule,
		RouterModule, FormsModule, ReactiveFormsModule, MomentModule,
	],
	declarations: [
		SetPingsComponent, TicketDetailsComponent, QaGeneratorComponent, CrucibleComponent,
		WorkLogComponent, TicketStatusComponent, DatesComponent,
		TicketsComponent, TicketComponent, WorkTimePipe, WatchersComponent, BranchInfoComponent
	],
	exports: [TicketsComponent]
})
export class TicketModule {}