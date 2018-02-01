import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import * as test from './../mock-data';


@Injectable()
export class TestInterceptor implements HttpInterceptor {

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		
		let body = {};
		if( /repos/.test(req.url) ) body = test.getRepos;
		else if( /tickets/.test(req.url) ) body = test.getTickets;
		else if( /getProfile/.test(req.url) ) body = test.getProfile;
		// else if( //.test() ) body = test.;
		// else if( //.test() ) body = test.;
		// else if( //.test() ) body = test.;

		const testResponse = new HttpResponse({body, status: 200});
		return Observable.of(testResponse).delay(1000);
	}
}