import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'dc-dropdown-item',
  templateUrl: './dropdown-item.component.html',
  styleUrls: ['./dropdown-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownItemComponent {
  @Input() navLink: any;

  @Input() baseUrl: string = '';
  @Input() emberUrl: string = '';
  @Input() teamUrl: string = '';

  constructor() {}
}
