import { ToastrService } from './../services/toastr.service';
import { AppError } from './app-error';

export class NotFoundError extends AppError {
	constructor(public orignalError:any, public toastr: ToastrService){
		super(`404 not found: ${orignalError}`, toastr);
	}
}