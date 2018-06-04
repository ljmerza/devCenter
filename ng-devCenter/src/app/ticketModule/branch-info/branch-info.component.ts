import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MiscService } from '@services';

@Component({
	selector: 'dc-branch-info',
	templateUrl: './branch-info.component.html',
	styleUrls: ['./branch-info.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BranchInfoComponent {

	constructor(public misc: MiscService) { }

	@Input() masterBranch:string = '';
	@Input() branch:string = '';
	@Input() commit:string = '';

}
