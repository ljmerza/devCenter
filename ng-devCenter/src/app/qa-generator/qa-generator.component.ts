import { Component, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';

import { JiraService } from './../services/jira.service';
import { NgbModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-qa-generator',
	templateUrl: './qa-generator.component.html',
	styleUrls: ['./qa-generator.component.css'],
	encapsulation: ViewEncapsulation.None
})
export class QaGeneratorComponent {

	@ViewChild('qaModal') content:ElementRef;
	time: NgbTimeStruct = {hour: 0, minute: 0, second: 0};
	hourStep = 1;
	minuteStep = 15;

	repos:Array<string> = [];
	branches:Array<string> = [];
	sourceBranches:Array<string> = [];

	constructor(public jira:JiraService, private modalService:NgbModal) { }

	qa_submit_disable = true;
	openQAModal(msrp:string):void {

		// get QA model instance
		let modelInstance = this.modalService.open(this.content, { windowClass: 'qa-modal' });


		// disabled submit button for QA gen
		this.qa_submit_disable = true;

		// get branches associated with this msrp then enable submit button
		this.jira.getTicketBranches(msrp).subscribe(branches => {
			this.qa_submit_disable = false;

			// get all branches found
			if(branches.status){
				branches.data.forEach( branch => {
					this.repos.push(branch.repo)
					this.branches.push(branch.branches[0])
				});
			}
			
			modelInstance.result.then( (confirm:string) => {
				console.log(branches, confirm, msrp)

				if(confirm){
					// generate QA stuff...
				}

			});	
		});
	}

}
