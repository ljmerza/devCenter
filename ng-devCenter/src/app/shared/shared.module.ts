import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgRedux, NgReduxModule, DevToolsExtension } from '@angular-redux/store';
import { RootState, initialState, rootReducer } from './store/store';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from './../../environments/environment';

// components
import { ModalComponent } from '@modal';
import { ToastrComponent } from './toastr/toastr.component';

// services
import { JiraService, JiraCommentsService, JiraPingsService } from '@services';
import { LocalStorageService } from './services/local-storage.service';
import { DataService } from './services/data.service';
import { ConfigService } from './services/config.service';
import { UserService } from './services/user.service';
import { OrderService } from './services/order.service';


import { MiscService, ToastrService, WebSocketService, ProfileService, GitService } from './services';

// interceptors
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';


@NgModule({
	imports: [
		HttpClientModule, NgbModule, NgReduxModule,
		ToastModule.forRoot(), BrowserAnimationsModule
	],
	declarations: [ModalComponent, ToastrComponent],
	exports: [ModalComponent, ToastrComponent]
})
export class SharedModule {
	constructor(private ngRedux:NgRedux<RootState>, private devTools: DevToolsExtension){
		const enhancers = devTools && devTools.isEnabled() ? [devTools.enhancer()] : [];
		ngRedux.configureStore(rootReducer, initialState, [], enhancers);
	}

	static forRoot(): ModuleWithProviders {
		return {
			ngModule: SharedModule, 
			providers: [
				UserService, LocalStorageService, ToastrService, ConfigService, 
				WebSocketService, MiscService, JiraService, ProfileService, JiraPingsService,
				DataService, GitService, JiraCommentsService, OrderService,
				{provide: HTTP_INTERCEPTORS, useClass: LoggerInterceptor, multi: true},
				{provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true}
			]
		};
	}
}