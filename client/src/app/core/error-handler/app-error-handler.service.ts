import {Injectable, ErrorHandler} from '@angular/core';

@Injectable()
export class AppErrorHandler extends ErrorHandler {
	constructor() {
		super();
	}

	handleError(error: any) {
		const errorMessage = (error.error && error.error.data) || error.statusText;
		console.log({ errorMessage});
		super.handleError(error);
	}
}
