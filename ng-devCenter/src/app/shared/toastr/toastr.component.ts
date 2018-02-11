import { Component, ViewContainerRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { ToastrService } from './../../shared/services/toastr.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
	selector: 'dc-toastr',
	templateUrl: './toastr.component.html',
	styleUrls: ['./toastr.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastrComponent {

	constructor(public toastr: ToastsManager, public toastrService: ToastrService, private vcr: ViewContainerRef) {
		toastr.setRootViewContainerRef(vcr);
		toastrService.toastObject = toastr;
	}
}
