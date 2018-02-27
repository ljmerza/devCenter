import { Component, ViewContainerRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ToastrService } from '@services';

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
