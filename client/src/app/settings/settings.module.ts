import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '@app/shared';
import { settingsReducer } from './settings.reducer';
import { SettingsEffects } from './settings.effects';
import { SettingsService } from './settings.service';
import { SettingsContainerComponent } from './components/settings-container.component';

@NgModule({
  imports: [
    SharedModule,
    StoreModule.forFeature('settings', settingsReducer),
    EffectsModule.forFeature([SettingsEffects])
  ],
  providers: [SettingsService],
  declarations: [SettingsContainerComponent],
  exports: [SettingsContainerComponent]
})
export class SettingsModule {}
