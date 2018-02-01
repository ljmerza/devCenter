import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {LocalStorageService} from '../services/local-storage.service';
import 'rxjs/add/operator/do';


@Injectable()
export class CacheInterceptor implements HttpInterceptor {

	constructor(public lStore:LocalStorageService) {}
 
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		
		// skip any requests that arent GET and if manually requested
		if(req.method !== 'GET' || req.params.get('isHardRefresh')) {
			return next.handle(req);
		}
	 
		// create empty cached observable
		let maybeCachedResponse: Observable<HttpEvent<any>> = Observable.empty();
	 
		// check the cache - set status as cached (304)
		const body = this.lStore.getItem(req.urlWithParams);
		const cachedResponse = new HttpResponse({body, status: 304});

		if(cachedResponse) {
			maybeCachedResponse = Observable.of(cachedResponse);
		}
	 
		// save network response
		const networkResponse = next.handle(req).do(event => {
			if (event instanceof HttpResponse) {
				this.lStore.setItem(req.urlWithParams, event.body);
			}
		});
	 
		// combine cached and regular response
		return Observable.concat(maybeCachedResponse, networkResponse);
	}
}