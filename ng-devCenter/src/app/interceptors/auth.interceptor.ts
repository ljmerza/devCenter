import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import { Headers, RequestOptions } from '@angular/http';
import { UserService } from './../services/user.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

	constructor(public user:UserService) { }

	/**
	*/
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const authReq = req.clone({ headers: this._createHeaders() });
		return next.handle(authReq);
	}

	private _createHeaders() {
		return new HttpHeaders()
			.set('Authorization', this._authorizationHeader() )
			.set('Content-Type', 'application/json');
	}

	/**
	*/
	private _authorizationHeader(): string {
		if(this.user.username && this.user.password){
			return "Basic " + btoa(`${this.user.username}:${this.user.password}`);
		} else {
			return '';
		}
		
	}
}