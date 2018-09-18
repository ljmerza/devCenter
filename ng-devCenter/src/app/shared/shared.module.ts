import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgRedux, NgReduxModule, DevToolsExtension } from '@angular-redux/store';
import { RootState, initialState, rootReducer } from '@store';
import { ToastrModule } from 'ngx-toastr';
import { NgProgressModule } from '@ngx-progressbar/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '@environment';

// components
import { ModalComponent } from '@modal';
import { ToastrComponent } from './toastr/toastr.component';
import { LoadingTableComponent } from './loading-table/loading-table.component';
import { UserDetailsComponent } from './user-details/user-details.component';


// services
import { 
	JiraService, JiraCommentsService, JiraPingsService, OrderService, 
	JiraWatchersService, ChatService, CrucibleService
} from '@services';

import { LocalStorageService } from './services/local-storage.service';
import { DataService } from './services/data.service';
import { ConfigService } from './services/config.service';
import { UserService } from './services/user.service';

import { MiscService, ToastrService, WebSocketService, ProfileService, GitService, ItemsService} from './services';

// interceptors
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';

import { DraggableDirective } from './draggable.directive';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';


@NgModule({
	imports: [
		HttpClientModule, NgbModule, NgReduxModule, BrowserAnimationsModule,
		CommonModule, BrowserModule, ToastrModule.forRoot(), NgProgressModule.forRoot()
	],
	declarations: [
		ModalComponent, ToastrComponent, LoadingTableComponent,
		UserDetailsComponent, DraggableDirective, ProgressBarComponent
	],
	exports: [
		ModalComponent, ToastrComponent, UserDetailsComponent, 
		LoadingTableComponent, DraggableDirective, ProgressBarComponent
	]
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
				UserService, LocalStorageService, ToastrService, ConfigService, ItemsService, ChatService,
				WebSocketService, MiscService, JiraService, ProfileService, JiraPingsService, CrucibleService,
				DataService, GitService, JiraCommentsService, OrderService, JiraWatchersService,
				{provide: HTTP_INTERCEPTORS, useClass: LoggerInterceptor, multi: true},
				{provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true}
			]
		};
	}
}