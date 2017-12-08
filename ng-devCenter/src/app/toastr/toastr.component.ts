import { Component, ViewContainerRef } from '@angular/core';
import { ToastrService } from './../services/toastr.service';

@Component({
	selector: 'app-toastr',
	templateUrl: './toastr.component.html',
	styleUrls: ['./toastr.component.scss']
})
export class ToastrComponent {

	constructor(public toastr: ToastrService, private vcr: ViewContainerRef) {
		this.toastr.toastr.setRootViewContainerRef(vcr);
	}
}
