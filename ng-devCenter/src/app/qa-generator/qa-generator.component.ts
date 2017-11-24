import { 
	Component, ViewChild, ElementRef, 
	ViewEncapsulation, ViewContainerRef, 
	EventEmitter, Output
} from '@angular/core';

import { NgbModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';

import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';
import config from '../services/config';

@Component({
	selector: 'app-qa-generator',
	templateUrl: './qa-generator.component.html',
	styleUrls: ['./qa-generator.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class QaGeneratorComponent {
	key:string;
	modalReference;
	loadingBranches:boolean = true;

	pcrNeeded:boolean = true;
	codeReview:boolean = true;
	qaSteps:string;
	logTime = {hour: 0, minute: 0};
	hourStep = 1;
	minuteStep = 15;
	repoArray = [];

	repos;
	branches;

	@ViewChild('qaModal') content:ElementRef;
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
	submitQA(formObj: NgForm): void {

		// reset data
		this.repos = [];
	
		// close modal
		this.modalReference.close();

		// get form values and reset form
		const formData = formObj.value;
		formObj.resetForm();

		// create POST data structure
		let postData = {
			qa_steps: formData.qaSteps,
			log_time: formData.logTime.hour * 60 + formData.logTime.minute,
			autoCR: formData.codeReview,
			autoPCR: formData.pcrNeeded,
			key: this.key,
			repos: this.repoArray.map( (repo,index) => {
				return {
					baseBranch: formData[`baseBranch-${index}`],
					repositoryName: formData[`repositoryName-${index}`],
					reviewedBranch: formData[`reviewedBranch-${index}`]
				};
			}),
		};

		// show informational toast
		if(!formData.qaSteps){
			this.toastr.showToast('Creating Crucible but not updating to Jira', 'info');
		} else {
			this.toastr.showToast('Creating Crucible and updating Jira', 'info');
		}

		// send POST request and notify results
		this.jira.generateQA(postData).subscribe(response => {
			this.toastr.showToast(`
				<a target="_blank" href='${config.jiraUrl}/browse/${this.key}'>Jira Link</a>
				<br>
				<a target="_blank" href='${config.crucibleUrl}/cru/${response.data.crucible_id}'>Crucible Link</a>
			`, 'success');
			this.newCrucible.emit({key: this.key, crucible_id: response.data.crucible_id})
		});
	}

	/*
	*/
	openQAModal(msrp:string, key:string): void {

		// save MSRP and reset selected repos
		this.key = key;
		this.repoArray = [];

		// open modal
		this.modalReference = this.modalService
			.open(this.content, { windowClass: 'qa-modal' })

		// once modal is closed if we just exited out then reset inputs
		this.modalReference.result.then( 
			result => {
				if(result){
					this.pcrNeeded = true;
					this.codeReview = true;
					this.qaSteps = '';
					this.logTime = {hour: 0, minute: 0};
					this.repoArray = [];
				}
			}, 
			() => this.newCrucible.emit({key: this.key})
		);

		// disabled submit button for QA gen
		this.loadingBranches = true;

		// get repos
		this.jira.getRepos().subscribe( 
			branches => this.repos = branches.data,
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);

		// get all branches associated with this msrp
		this.jira.getTicketBranches(msrp).subscribe(
			response => {
				this.loadingBranches = false;
				this.processBranches(response.data);
			},
			error => {
				this.loadingBranches = false;
				this.toastr.showToast(this.jira.processErrorResponse(error), 'error');
			}
		);
	}

	/*
	*/
	processBranches(branches): void {

		// for each repo found create arrays of data needed
		this.repoArray = branches.map( (repo, index) => {

			// for each matching dev branch found get list of branches
			return repo.branches.map( devBranch => {
				let selection = {
					allRepos: this.repos,
					allBranches: repo.all,

					repositoryName: repo.repo,
					reviewedBranch: devBranch,
					baseBranch: '',
				};

				// get base branch of current selection
				let baseBranch;
				if(repo.repo === 'external_modules'){
					baseBranch = ['dev'];
				} else {
					baseBranch = this.getBaseBranch(repo.all);
				}

				selection.baseBranch = baseBranch.length == 1 ? baseBranch[0] : '';

				return selection;
			})[0];	
		});
	}


	/*
	*/
	getBaseBranch(repos): Array<any> {

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
	deleteDevBranch(branchName): void {
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

	/*
	*/
	addRepo(): void {
		const selection = {
			allRepos: this.repos,
			allBranches: [],

			repositoryName: '',
			reviewedBranch: '',
			baseBranch: '',
		};

		this.repoArray.push(selection);
	}

	/*
	*/
	getBranches(repoName:string, index): void {
		this.repoArray[index].allBranches = ['Loading Branches...'];

		this.jira.getBranches(repoName).subscribe( 
			branches => {
				this.repoArray[index].allBranches = branches.data;
			},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

}
