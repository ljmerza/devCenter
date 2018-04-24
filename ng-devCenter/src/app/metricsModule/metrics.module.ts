import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';

import { SharedModule } from '../shared/shared.module';
import { DevStatsComponent } from './dev-stats/dev-stats.component';


@NgModule({
  imports: [CommonModule, SharedModule, DataTablesModule],
  declarations: [DevStatsComponent]
})
export class MetricsModule { }
