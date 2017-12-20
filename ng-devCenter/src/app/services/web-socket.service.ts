import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { map, catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';

export interface Socket {
	on(event: string, callback: (data: any) => void );
	emit(event: string, data: any);
}

declare var io : {
	connect(url: string): Socket;
};

@Injectable()
export class WebSocketService {

	socket: Socket;
	observer: Observer<any>;

	/*
	*/
	public getTickets(): Observable<any> {
		this.socket = io.connect(`${environment.apiUrl}:${environment.port}`);

		this.socket.on('update_tickets', res => {
			this.observer.next(res.data);
		});

		return this.createObservable();
	}

	/*
	*/
	private createObservable(): Observable<any> {
		return Observable.create((observer: Observer<any>) => {
			this.observer = observer;
		});
	}

	private handleError(error) {
		if (error.error instanceof Error) {
			let errMessage = error.error.message;
			return Observable.throw(errMessage);
		}
		return Observable.throw(error || 'Socket.io server error');
	}

}