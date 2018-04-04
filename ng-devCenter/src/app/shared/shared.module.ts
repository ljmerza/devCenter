import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgProgressModule } from 'ngx-progressbar';
import { NgRedux, NgReduxModule, DevToolsExtension } from '@angular-redux/store';
import { RootState, initialState, rootReducer } from './store/store';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from './../../environments/environment';

// components
import { ModalComponent } from '@modal';
import { ToastrComponent } from './toastr/toastr.component';
import { LoadingTableComponent } from './loading-table/loading-table.component';

// services
import { JiraService, JiraCommentsService, JiraPingsService, OrderService, JiraWatchersService } from '@services';
import { LocalStorageService } from './services/local-storage.service';
import { DataService } from './services/data.service';
import { ConfigService } from './services/config.service';
import { UserService } from './services/user.service';


import { MiscService, ToastrService, WebSocketService, ProfileService, GitService, ItemsService} from './services';

// interceptors
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';

import { DraggableDirective } from './draggable.directive';


@NgModule({
	imports: [
		HttpClientModule, NgbModule, NgReduxModule, NgProgressModule,
		ToastModule.forRoot(), BrowserAnimationsModule
	],
	declarations: [ModalComponent, ToastrComponent, LoadingTableComponent, DraggableDirective],
	exports: [ModalComponent, ToastrComponent, LoadingTableComponent, DraggableDirective]
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
				UserService, LocalStorageService, ToastrService, ConfigService, ItemsService,
				WebSocketService, MiscService, JiraService, ProfileService, JiraPingsService,
				DataService, GitService, JiraCommentsService, OrderService, JiraWatchersService,
				{provide: HTTP_INTERCEPTORS, useClass: LoggerInterceptor, multi: true},
				{provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true}
			]
		};
	}
}