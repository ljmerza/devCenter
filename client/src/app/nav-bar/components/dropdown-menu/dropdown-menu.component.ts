import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DropdownItem } from '../../models';

@Component({
  selector: 'dc-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownMenuComponent {
  // @Input() navLinks: Array<DropdownItem> = []; // items is on array needs to be on object
  @Input() navLinks:any = [];

  @Input() title: string = '';
  @Input() isSubMenu: boolean = false;
  @Input() showDropdown: boolean = true;

  @Input() baseUrl: string = '';
  @Input() emberUrl: string = '';
  @Input() teamUrl: string = '';

  constructor() {}
}
