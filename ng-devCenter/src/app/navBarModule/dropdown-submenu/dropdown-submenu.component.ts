import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'dc-dropdown-submenu',
	templateUrl: './dropdown-submenu.component.html',
	styleUrls: ['./dropdown-submenu.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownSubmenuComponent {
	@Input() navLinks;

	@Input() baseUrl:string = '';
	@Input() emberUrl:string = '';
	@Input() teamUrl:string = '';

	constructor() { }
}
