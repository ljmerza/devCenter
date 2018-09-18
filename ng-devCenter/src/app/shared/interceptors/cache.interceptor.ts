import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';

import { Observable, EMPTY, of } from 'rxjs';
import { concat } from 'rxjs/operators';

import { LocalStorageService } from '@services';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {

	constructor(public lStore:LocalStorageService) {}
 
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

		// skip any requests that arent GET or if manually requested
		if(req.method !== 'GET' || req.params.get('isHardRefresh')) {
			return next.handle(req);
		}
	 
		// create empty cached observable
		let maybeCachedResponse: Observable<HttpEvent<any>> = EMPTY;
	 
		// check the cache - set status as cached (304)
		const body = this.lStore.getItem(req.urlWithParams) || {};
		const cachedResponse = new HttpResponse({body, status: 304});
		cachedResponse.body.hardRequest = true;

		if(cachedResponse) {
			maybeCachedResponse = of(cachedResponse);
		}

		// save network response
		const networkResponse = next.handle(req).do(event => {
			if (event instanceof HttpResponse) {
				this.lStore.setItem(req.urlWithParams, event.body);
			}
		});

		return maybeCachedResponse.pipe(concat(networkResponse));

	}
}