import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'dc-branch-info',
	templateUrl: './branch-info.component.html',
	styleUrls: ['./branch-info.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BranchInfoComponent {

	constructor() { }

	@Input() sprint:string = '';
	@Input() branch:string = '';
	@Input() commit:string = '';

}
