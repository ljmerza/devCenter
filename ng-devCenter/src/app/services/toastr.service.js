import { Injectable } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class ToastrService {


	constructor(public toastr:ToastsManager) {
		
	}

	/*
	*/
	showToast(message:string, type:string) {
		if(type === 'success'){
			this.toastr.success(message);
		} else if(type === 'error'){
			this.toastr.error(message);
		}
		
	}
}
