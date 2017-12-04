import { Component, Input, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';

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
		private modalService: NgbModal,
		vcr: ViewContainerRef
	) { }

	openPingModel(){
		this.modalService.open(this.content).result.then( (pingType) => {
			this.jira.setPing({
			key: this.key,
			field: pingType,
			value: 0
			}).subscribe(
				response => {
					pingType = pingType.replace('_', ' ');
					this.toastr.showToast(`${pingType} reset. You should get a ping within the next minute.`, 'success');
				},
				error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
			);
		}, () => null);
	}

}
