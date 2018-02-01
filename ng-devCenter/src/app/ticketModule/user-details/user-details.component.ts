import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MiscService } from './../../shared/services/misc.service';


@Component({
	selector: 'dc-user-details',
	templateUrl: './user-details.component.html',
	styleUrls: ['./user-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailsComponent {

	@Input() msrp;
	@Input() user;

	constructor(public misc: MiscService) { }

}
