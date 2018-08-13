import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { UserService } from '@services';

@Component({
	selector: 'dev-center-dropdown-submenu',
	templateUrl: './dropdown-submenu.component.html',
	styleUrls: ['./dropdown-submenu.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownSubmenuComponent {

	@Input() title:string = '';
	@Input() navLinks:Array<any> = [];

	constructor(public user:UserService) { }
}
