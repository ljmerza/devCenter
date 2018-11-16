import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@app/shared';
import { PanelComponent } from './components/panel/panel.component';

@NgModule({
  declarations: [PanelComponent],
  imports: [CommonModule, SharedModule],
  exports: [PanelComponent]
})
export class PanelModule { }
