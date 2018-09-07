import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { DevStatsComponent } from './dev-stats/dev-stats.component';


@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [DevStatsComponent]
})
export class MetricsModule { }
