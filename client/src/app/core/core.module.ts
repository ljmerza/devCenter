import { NgModule, Optional, SkipSelf, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ToastrModule } from 'ngx-toastr';

import { environment } from '@env/environment';

import { LocalStorageService } from './local-storage/local-storage.service';
import { AnimationsService } from './animations/animations.service';
import { TitleService } from './title/title.service';
import { reducers, metaReducers } from './core.state';
import { AppErrorHandler } from './error-handler/app-error-handler.service';
import { httpInterceptorProviders } from '@app/core/http-interceptors';

import { StoreRouterConnectingModule, RouterStateSerializer } from '@ngrx/router-store';
import { CustomSerializer } from './router/custom-serializer';
import { NotificationService } from './notifications/notification.service';

import { ReposService, ReposEffects } from './repos';
import { ProfileService, ProfileEffects } from './profile';

@NgModule({
  imports: [
    // angular
    CommonModule,
    HttpClientModule,
    ToastrModule.forRoot({
      closeButton: true,
      enableHtml: true,
      timeOut: 5000
    }),

    // ngrx
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreRouterConnectingModule.forRoot(),
    EffectsModule.forRoot([ReposEffects, ProfileEffects]),
    environment.production ? [] : StoreDevtoolsModule.instrument({ name: 'Dev Center' })
  ],
  declarations: [],
  providers: [
    NotificationService,
    LocalStorageService,
    AnimationsService, 
    ReposService,
    ProfileService,
    ...httpInterceptorProviders,
    TitleService,
    { provide: ErrorHandler, useClass: AppErrorHandler },
    { provide: RouterStateSerializer, useClass: CustomSerializer }
  ],
  exports: []
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule');
    }
  }
}
