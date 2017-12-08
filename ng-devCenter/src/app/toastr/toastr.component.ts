import { Component, ViewContainerRef } from '@angular/core';
import { ToastrService } from './../services/toastr.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
	selector: 'app-toastr',
	templateUrl: './toastr.component.html',
	styleUrls: ['./toastr.component.scss']
})
export class ToastrComponent {

	constructor(public toastr: ToastsManager, public toastrService: ToastrService, private vcr: ViewContainerRef) {
		toastr.setRootViewContainerRef(vcr);
		toastrService.toastObject = toastr;
	}
}
