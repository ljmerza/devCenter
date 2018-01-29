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

		let toastrOptions = Object.assign( {}, this.toastrOptions);

		// set custom life of the toast if geiven
		if(toastLife){
			toastrOptions = Object.assign( {}, toastrOptions, {toastLife} );
		} else if(sticky){
			// if sticky then show 'forever'
			toastrOptions = Object.assign( {}, toastrOptions, {toastLife:9999999} );
		}

		if(message_type === 'success'){
			this.toastObject.success(message, null, toastrOptions);

		} else if(message_type === 'error'){
			this.toastObject.error(message, null, toastrOptions);
			
		} else if(message_type === 'info'){
			this.toastObject.info(message, null, toastrOptions);
		}
		
	}
}
