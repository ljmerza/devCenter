import { Injectable } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class ToastrService {

	private toastrOptions: Object = {
		showCloseButton: true, 
		animate: 'fade', 
		enableHTML: true
	};

	constructor(public toastr:ToastsManager) {}

	/*
	*/
	public showToast(message:string, message_type:string): void {

		if(message_type === 'success'){
			this.toastr.success(message, null, this.toastrOptions);

		} else if(message_type === 'error'){
			this.toastr.error(message, null, this.toastrOptions);
			
		} else if(message_type === 'info'){
			this.toastr.info(message, null, this.toastrOptions);
		}
		
	}
}
