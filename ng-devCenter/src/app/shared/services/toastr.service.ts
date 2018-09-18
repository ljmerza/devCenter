import { Injectable } from '@angular/core';

@Injectable()
export class ToastrService {
	toastObject;

	private toastrOptions = {
		closeButton: true, 
		enableHtml: true,
		timeOut: 5000
	};

	/**
	 * 
	 * @param {string} message the message to show in the toast
	 * @param {string} message_type error, success, or info (error default)
	 * @param {boolean} sticky default false do we make toast sticky?
	 * @param {number} timeOut default 5000 ms
	 */
	public showToast(message:string, message_type:string, sticky:boolean=false): void {
		let toastrOptions = {...this.toastrOptions};

		// if sticky then show 'forever'
		if(sticky){
			toastrOptions = { ...toastrOptions, ...{timeOut:9999999} };
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
