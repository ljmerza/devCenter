import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { DevStatsComponent } from './dev-stats/dev-stats.component';


@NgModule({
  imports: [CommonModule, SharedModule, NgxDatatableModule],
  declarations: [DevStatsComponent]
})
export class MetricsModule { }
