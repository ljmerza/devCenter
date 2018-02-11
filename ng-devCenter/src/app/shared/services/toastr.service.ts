import { Injectable } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class ToastrService {
	toastObject: ToastsManager;

	private toastrOptions = {
		showCloseButton: true, 
		animate: 'fade', 
		enableHTML: true,
		toastLife: 5000
	};


	/*
	*/
	public showToast(message:string, message_type:string, sticky=false, toastLife=0): void {
		let toastrOptions = {...this.toastrOptions};

		// set custom life of the toast if geiven
		if(toastLife){
			toastrOptions = { ...toastrOptions, ...{toastLife} };
		} else if(sticky){
			// if sticky then show 'forever'
			toastrOptions = { ...toastrOptions, ...{toastLife:9999999} };
		}

		if(message_type === 'success'){
			this.toastObject.success(message, null, toastrOptions);	
		} else if(message_type === 'info'){
			this.toastObject.info(message, null, toastrOptions);
		} else {
			this.toastObject.error(message, null, toastrOptions);
		}
		
	}
}
