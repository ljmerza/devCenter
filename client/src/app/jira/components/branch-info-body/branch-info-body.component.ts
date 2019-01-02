import {Component, ChangeDetectionStrategy, Input} from '@angular/core';

@Component({
	selector: 'dc-branch-info-body',
	templateUrl: './branch-info-body.component.html',
	styleUrls: ['./branch-info-body.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchInfoBodyComponent {
	constructor() {}

	@Input() sprint = '';
	@Input() branch = '';
	@Input() commit = '';
	@Input() key = '';
	@Input() epicLink = '';

	get masterName() {
		if (this.sprint) return this.key.split('-')[0] + this.sprint;
		else return '';
	}
}
