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
	time: NgbTimeStruct;
	hourStep = 1;
	minuteStep = 15;

	selectArray = [];
	branchDivider = 16;

	constructor(public jira:JiraService, private modalService:NgbModal) { }

	qa_submit_disable = true;
	openQAModal(msrp:string):void {

		// get QA model instance
		let modelInstance = this.modalService.open(this.content, { windowClass: 'qa-modal' });


		// disabled submit button for QA gen
		this.qa_submit_disable = true;

		// get branches associated with this msrp then enable submit button
		this.jira.getTicketBranches(msrp).subscribe(repos => {
			this.qa_submit_disable = false;

			if(repos.status){

				let selectArray = [];

				// for each repo found create arrays of data needed
				repos.data.forEach( (repo, index) => {

					// for each matching dev branch found get list of branches
					repo.branches.forEach( devBranch => {

						let selection = {
							repo: repo.repo,
							devBranch: devBranch,
							allBranches: [],
							sourceBranches: []
						};

						// divide all branches from a repo into source and the rest
						repo.all.forEach( devBranch => {

							if(devBranch.length > this.branchDivider){
								selection.allBranches.push(devBranch);
							} else {
								selection.sourceBranches.push(devBranch);
							}
						});

						selectArray.push(selection);
					});	
				});

				this.selectArray = selectArray;
			}
			
			modelInstance.result.then( (confirm:string) => {

				if(confirm){
					// generate QA stuff...
				}

			});	
		});
	}

	/*
	*/
	deleteDevBranch(branchName){
		const index = this.selectArray.findIndex( branch => {
			return branch.devBranch === branchName;
		});

		this.selectArray.splice(index,1);
	}

}
