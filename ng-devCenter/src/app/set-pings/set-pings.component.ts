import { Component, Input, ViewChild, ElementRef } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';

@Component({
	selector: 'app-set-pings',
	templateUrl: './set-pings.component.html',
	styleUrls: ['./set-pings.component.scss']
})
export class SetPingsComponent {

	@Input() key;
	@ViewChild('pingModal') content: ElementRef;

	constructor(
		public toastr: ToastrService, 
		public jira: JiraService, 
		private modalService: NgbModal
	) { }

	openPingModel(){
		this.modalService.open(this.content).result.then( (pingType) => {
			this.jira.setPing({
				key: this.key,
				ping_type: pingType
			}).subscribe(
				response => {
					pingType = pingType.replace('_', ' ');
					this.toastr.showToast(`${pingType} ping reset: ${response.data}`, 'success');
				},
				error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
			);
		}, () => null);
	}

}