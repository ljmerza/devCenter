import { Injectable } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class ToastrService {

	toastrOptions = {
		showCloseButton: true, 
		animate: 'fade', 
		enableHTML: true
	};


	constructor(public toastr:ToastsManager) {
		
	}

	/*
	*/
	showToast(message:string, message_type:string) {
		if(message_type === 'success'){
			this.toastr.success(message, null, this.toastrOptions);
		} else if(message_type === 'error'){
			this.toastr.error(message, null, this.toastrOptions);
		}
		
	}
}
