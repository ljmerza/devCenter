import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'dc-ticket-dates',
	templateUrl: './dates.component.html',
	styleUrls: ['./dates.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatesComponent implements OnInit {

	constructor() { }

	@Input() datetime;

	ngOnInit() {
	}

}
