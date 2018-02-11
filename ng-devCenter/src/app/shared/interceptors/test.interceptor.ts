import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import * as test from './../mock-data';


@Injectable()
export class TestInterceptor implements HttpInterceptor {

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const url = req.url;
		const method = req.method;
		let body = {};
		console.log('--', url, method)

		if(/repos/.test(url) ) body = test.getRepos;
		else if( /tickets/.test(url) ) body = test.getTickets;
		else if( /jira\/profile/.test(url) ) body = test.getProfile;
		else if( /jira\/comment/.test(url) ){
			if(method === 'PUT') body = test.editComment;
			if(method === 'DELETE') body = test.deleteComment;
			if(method === 'POST') body = test.commentResponse;
		} 
		else if( /\/navbar/.test(url) ) body = test.commentResponse;
		// else if( //.test(url) ) body = test.;
		// else if( //.test(url) ) body = test.;

		const testResponse = new HttpResponse({body, status: 200});
		return Observable.of(testResponse).delay(1000);
	}
}