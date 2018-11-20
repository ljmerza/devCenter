import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'dc-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsComponent {

	@Input() ticket;
	@Output() expandRow = new EventEmitter

  	constructor() { }
}
