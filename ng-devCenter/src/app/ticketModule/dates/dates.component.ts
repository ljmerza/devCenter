import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: '.dc-ticket-dates',
	templateUrl: './dates.component.html',
	styleUrls: ['./dates.component.scss']
})
export class DatesComponent implements OnInit {

	constructor() { }

	@Input() datetime;

	ngOnInit() {
	}

}
