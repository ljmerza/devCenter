import { 
	Component, ViewChild, ElementRef, 
	ViewEncapsulation, ViewContainerRef, 
	EventEmitter, Output 
} from '@angular/core';

import { JiraService } from './../services/jira.service';
import { NgbModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

import { ToastrService } from './../services/toastr.service';

import { forkJoin } from "rxjs/observable/forkJoin";

import config from '../services/config';

@Component({
	selector: 'app-qa-generator',
	templateUrl: './qa-generator.component.html',
	styleUrls: ['./qa-generator.component.css'],
	encapsulation: ViewEncapsulation.None
})
export class QaGeneratorComponent {
	msrp;
	modalReference;
	loadingBranches:boolean = true;

	formRepos;
	pcrNeeded:boolean = true;
	codeReview:boolean = true;
	qaSteps:string;
	logTime = {hour: 0, minute: 0};

	@ViewChild('qaModal') content:ElementRef;
	hourStep = 1;
	minuteStep = 15;

	repoArray = [];
	branchDivider = 16;

	@Output() newCrucible = new EventEmitter();

	constructor(
		public jira:JiraService, 
		private modalService:NgbModal, 
		public toastr: ToastrService, 
		public vcr: ViewContainerRef
	) {
		this.toastr.toastr.setRootViewContainerRef(vcr);
	}

	/*
	*/
	submitQA(formData){

		// close modal
		this.modalReference.close();

		// get logged time in minutes
		const logTime = formData.logTime.hour * 60 + formData.logTime.minute;

		// create POST data structure
		let postData = {
			repos: [],
			qa_steps: formData.qaSteps,
			log_time: logTime,
			autoCR: formData.codeReview,
			autoPCR: formData.pcrNeeded
		};

		// get all repos selected int proper format
		for(let i=0; i <this.repoArray.length; i++){
			postData.repos.push({
				baseBranch: formData[`baseBranch-${i}`],
				repositoryName: formData[`repositoryName-${i}`],
				reviewedBranch: formData[`reviewedBranch-${i}`]
			});
		}

		// send POST request and notify results
		this.jira.generateQA(postData).subscribe(response => {
			if(response.status){
				this.toastr.showToast(response.data, 'success');
				this.newCrucible.emit({jira: this.msrp, crucible: response.data})
			} else {
				this.toastr.showToast(response.data, 'error');
			}
		});
	}

	qa_submit_disable = true;
	openQAModal(msrp:string):void {

		// save MSRP and reset selected repos
		this.msrp = msrp;
		this.repoArray = [];

		// open modal
		this.modalReference = this.modalService.open(this.content, { windowClass: 'qa-modal' });

		// disabled submit button for QA gen
		this.qa_submit_disable = true;

		// get all repos and branches associated with this msrp then enable submit button
		forkJoin([this.jira.getTicketBranches(msrp), this.jira.getRepos()]).subscribe(data => {

			const branches = data[0];
			const repos = data[1];

			this.loadingBranches = false;
			
			// make sure we got back data
			if(!branches.status){
				this.toastr.showToast(branches.data, 'error');
				return;
			} else if (!repos.status){
				this.toastr.showToast(`<a href='${config.crucibleUrl}/${repos.data}'>repos.data</a>`, 'error');
				return;
			}

			// allow submit of form
			this.qa_submit_disable = false;

			// for each repo found create arrays of data needed
			this.repoArray = branches.data.map( (repo, index) => {

				// for each matching dev branch found get list of branches
				return repo.branches.map( devBranch => {
					let selection = {
						allRepos: repos.data,
						allBranches: repo.all,

						repositoryName: repo.repo,
						reviewedBranch: devBranch,
						baseBranch: '',
					};

					// get base branch of current selection
					const baseBranch = this.getBaseBranch(repo.all);
					selection.baseBranch = baseBranch.length == 1 ? baseBranch[0] : '';

					return selection;
				});	
			})[0];
		});
	}

	/*
	*/
	getBaseBranch(repos){

		// get all short branch names with numbers in them and sort
		const selections = repos
		.filter( branch => branch.length < 15)
		.map( branch => branch.replace(/[^0-9.]/g,''))
		.sort();

		// get branch short branch name that has highest version found
		return repos
		.filter( branch => branch.length < 15 && branch.includes(selections[selections.length-1]));
	}

	/*
	*/
	deleteDevBranch(branchName){
		// if only one left cant delete
		if(this.repoArray.length == 1){
			this.toastr.showToast('Must have at least one repo.', 'error');
			return;
		}

		const index = this.repoArray.findIndex( branch => {
			return branch.devBranch === branchName;
		});

		this.repoArray.splice(index,1);
	}

}
