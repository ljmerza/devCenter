import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '@app/shared';
import { FEATURE_NAME } from './nav-bar.state';
import { NavBarEffects } from './nav-bar.effects';
import { NavBarService } from './nav-bar.service';
import { navBarReducer } from './nav-bar.reducer';

import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { DropdownMenuComponent } from './components/dropdown-menu/dropdown-menu.component';
import { DropdownItemComponent } from './components/dropdown-item/dropdown-item.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature(FEATURE_NAME, navBarReducer),
    EffectsModule.forFeature([NavBarEffects])
  ],
  declarations: [NavBarComponent, DropdownMenuComponent, DropdownItemComponent],
  providers: [NavBarService],
  exports: [NavBarComponent]
})
export class NavBarModule {}
