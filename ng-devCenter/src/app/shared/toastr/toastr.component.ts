import { Component, ViewContainerRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { ToastrService as ToastrServiceRoot } from 'ngx-toastr';
import { ToastrService } from '@services';

@Component({
	selector: 'dc-toastr',
	templateUrl: './toastr.component.html',
	styleUrls: ['./toastr.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastrComponent {

	constructor(public toastr: ToastrServiceRoot, public toastrService: ToastrService, private vcr: ViewContainerRef) {
		toastrService.toastObject = toastr;
	}
}
