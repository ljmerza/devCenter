import { Injectable } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class ToastrService {

	private toastrOptions = {
		showCloseButton: true, 
		animate: 'fade', 
		enableHTML: true,
		toastLife: 5000
	};

	toastObject: ToastsManager;

	/*
	*/
	public showToast(message:string, message_type:string, sticky=false, toastLife=0): void {

		// if toastLife then set else if sticky then show 'forever'
		if(toastLife){
			this.toastrOptions.toastLife = toastLife;
		} else if(sticky){
			this.toastrOptions.toastLife = 9999999;
		}

		if(message_type === 'success'){
			this.toastObject.success(message, null, this.toastrOptions);

		} else if(message_type === 'error'){
			this.toastObject.error(message, null, this.toastrOptions);
			
		} else if(message_type === 'info'){
			this.toastObject.info(message, null, this.toastrOptions);
		}
		
	}
}
