import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgRedux, NgReduxModule, DevToolsExtension } from '@angular-redux/store';
import { RootState, initialState, rootReducer } from './store/store';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from './../../environments/environment';

// components
import { ModalComponent } from './modal/modal.component';
import { ToastrComponent } from './toastr/toastr.component';

// services
import { JiraService } from './services/jira.service';
import { JiraCommentsService } from './services/jira/jira-comments.service';
import { JiraPingsService } from './services/jira/jira-pings.service';

import { LocalStorageService } from './services/local-storage.service';
import { MiscService } from './services/misc.service';
import { UserService } from './services/user.service';
import { ToastrService } from './services/toastr.service';
import { ConfigService } from './services/config.service';
import { WebSocketService } from './services/web-socket.service';
import { ProfileService } from './services/profile.service';
import { GitService } from './services/git.service';
import { DataService } from './services/data.service';

// interceptors
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { TestInterceptor } from './interceptors/test.interceptor';


let providers = [
	UserService, LocalStorageService, ToastrService, ConfigService, 
	WebSocketService, MiscService, JiraService, ProfileService, JiraPingsService,
	DataService, GitService, JiraCommentsService,
	{provide: HTTP_INTERCEPTORS, useClass: LoggerInterceptor, multi: true},
	{provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true}
];

if(environment.test){
	providers.push({ provide: HTTP_INTERCEPTORS, useClass: TestInterceptor, multi: true});
}

@NgModule({
	imports: [
		HttpClientModule, NgbModule, NgReduxModule,
		ToastModule.forRoot(), BrowserAnimationsModule
	], // BrowserAnimationsModule needed for ToastModule
	declarations: [ModalComponent, ToastrComponent],
	exports: [ModalComponent, ToastrComponent],
	providers,
})
export class SharedModule {
	constructor(private ngRedux:NgRedux<RootState>, private devTools: DevToolsExtension){
		ngRedux.configureStore(rootReducer, initialState, [], [devTools.enhancer()]);
	}

	static forRoot(): ModuleWithProviders {
		return {ngModule: SharedModule, providers};
	}
}