import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { UserService } from '@services';

@Component({
	selector: 'dc-dropdown-menu',
	templateUrl: './dropdown-menu.component.html',
	styleUrls: ['./dropdown-menu.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownMenuComponent {

	@Input() title:string = '';
	@Input() showDropdown:boolean = true;
	@Input() navLinks:Array<any> = [];
	
	@Input() baseUrl:string = '';
	@Input() emberUrl:string = '';
	@Input() teamUrl:string = '';

	constructor(public user:UserService) { }
}
