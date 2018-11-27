import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectSettings } from '@app/settings/settings.selectors';

import { PanelComponent } from '@app/panel/components/panel/panel.component';

@Component({
	selector: 'dc-add-log',
	templateUrl: './add-log.component.html',
	styleUrls: ['./add-log.component.scss']
})
export class AddLogComponent implements OnInit {
	@ViewChild(PanelComponent) modal: PanelComponent;
	@Input() ticket;
	
	constructor() { }

	ngOnInit() {
	}

	addComment(){

	}
	cancelEdit(){

	}

}
