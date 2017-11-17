import { ToastrService } from './../services/toastr.service';
import { AppError } from './app-error';

export class FalseError extends AppError {
	constructor(public orignalError:any, public toastr: ToastrService){
		super(orignalError.data, toastr);
	}
}