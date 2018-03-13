import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/do';


@Injectable()
export class LoggerInterceptor implements HttpInterceptor {

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  		const started = Date.now();

    	return next.handle(req).do(event => {

    		// if we are not a cached response then log request time
			if (event instanceof HttpResponse && event.status !== 304) {
				const elapsed = Date.now() - started;
				const baseUrl = req.urlWithParams.split('?')[0];
				console.debug(`Request for ${baseUrl} took ${elapsed} ms.`);
			}
		});
	}
}