import { ToastrService } from './../services/toastr.service';

export class AppError {
	constructor(public orignalError:any, public toastr: ToastrService){
		this.toastr.showToast(orignalError, 'error');
	}
}