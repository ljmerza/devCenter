import {Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class NotificationService {
	toastr2;
	constructor(private toastr: ToastrService) {
		this.toastr2 = toastr;
		console.log(toastr)
	}

	default(message: string) {
		this.toastr.info(message);
	}

	info(message: string) {
		this.toastr.info(message);
	}

	success(message: string) {
		this.toastr.success(message, '', {timeOut: 1000000});
	}

	warn(message: string) {
		this.toastr.warning(message);
	}

	error(error) {
		if (error instanceof HttpErrorResponse) {
			error = (error.error && error.error.data) || error.statusText;
		}

		if (this.toastr2) this.toastr2.error(error, '', {timeOut: 10000});
	}
}
