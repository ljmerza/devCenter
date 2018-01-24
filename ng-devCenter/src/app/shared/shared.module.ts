import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastModule } from 'ng2-toastr/ng2-toastr';


import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from './../../environments/environment';

// components
import { ModalComponent } from './modal/modal.component';
import { ToastrComponent } from './toastr/toastr.component';

// services
import { JiraService } from './services/jira.service';
import { JiraServiceTest } from './services/testing/jira.service';
import { LocalStorageService } from './services/local-storage.service';
import { MiscService } from './services/misc.service';
import { UserService } from './services/user.service';
import { ToastrService } from './services/toastr.service';
import { ConfigService } from './services/config.service';
import { WebSocketService } from './services/web-socket.service';

// interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';

@NgModule({
	imports: [
		CommonModule, HttpClientModule, BrowserAnimationsModule, 
		NgbModule.forRoot(), ToastModule.forRoot()
	],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
		{ provide: HTTP_INTERCEPTORS, useClass: LoggerInterceptor, multi: true},
		{ provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true}
	],
	declarations: [ModalComponent, ToastrComponent],
	exports: [ModalComponent, ToastrComponent]
})
export class SharedModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: SharedModule,
			providers: [
				UserService, LocalStorageService, ToastrService, ConfigService, 
				WebSocketService, MiscService,
				// if in testing mode use test endpoint else use regular endpoints
				{ provide: JiraService, useClass: environment.test ? JiraServiceTest : JiraService},
			]
		}
	}
}