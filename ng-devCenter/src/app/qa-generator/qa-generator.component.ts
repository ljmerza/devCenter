import { Component, ViewChild, ElementRef, ViewEncapsulation, ViewContainerRef } from '@angular/core';

import { JiraService } from './../services/jira.service';
import { NgbModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

import { ToastrService } from './../services/toastr.service';

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

	constructor(public jira:JiraService, private modalService:NgbModal, public toastr: ToastrService, vcr: ViewContainerRef) {
		this.toastr.toastr.setRootViewContainerRef(vcr);
	}

	qa_submit_disable = true;
	openQAModal(msrp:string):void {

		this.selectArray = [];

		// get QA model instance
		let modelInstance = this.modalService.open(this.content, { windowClass: 'qa-modal' });


		// disabled submit button for QA gen
		this.qa_submit_disable = true;

		// get branches associated with this msrp then enable submit button
		this.jira.getTicketBranches(msrp).subscribe(repos => {
			

			if(!repos.status){
				this.toastr.showToast(repos.data, 'error');
				return;
			}

			this.qa_submit_disable = false;

			// for each repo found create arrays of data needed
			this.selectArray = repos.data.map( (repo, index) => {

				// for each matching dev branch found get list of branches
				return repo.branches.map( devBranch => {

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

					return selection;
				});	
			})[0];

			console.log(this.selectArray)
			
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
		
		// if only one left cant delete
		if(this.selectArray.length == 1){
			this.toastr.showToast('Must have at least one repo.', 'error');
			return;
		}

		const index = this.selectArray.findIndex( branch => {
			return branch.devBranch === branchName;
		});

		this.selectArray.splice(index,1);
	}

}
