import { 
	Component, ViewChild, ElementRef, 
	ViewEncapsulation, ViewContainerRef, 
	EventEmitter, Output, OnInit
} from '@angular/core';

import { JiraService } from './../services/jira.service';
import { NgbModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';

import { ToastrService } from './../services/toastr.service';
import config from '../services/config';

@Component({
	selector: 'app-qa-generator',
	templateUrl: './qa-generator.component.html',
	styleUrls: ['./qa-generator.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class QaGeneratorComponent implements OnInit {
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
	ngOnInit(): void {
		this.jira.getRepos()
		.subscribe( repos => this.repos = repos);
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
			this.toastr.showToast(`
				<a target="_blank" href='${config.jiraUrl}/browse/${this.key}'>Jira Link</a>
				<br>
				<a target="_blank" href='${config.crucibleUrl}/cru/${response.data}'>Crucible Link</a>
			`, 'success');
			this.newCrucible.emit({jira: this.key, crucible: response.data})
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
		this.modalReference.result.then( result => {
			if(result){
				this.pcrNeeded = true;
				this.codeReview = true;
				this.qaSteps = '';
				this.logTime = {hour: 0, minute: 0};
				this.repoArray = [];
			}
		}, () => null);

		// disabled submit button for QA gen
		this.loadingBranches = true;

		// get all repos and branches associated with this msrp then enable submit button
		this.jira.getTicketBranches(msrp).subscribe(branches => {
			this.processBranches(branches);
			this.loadingBranches = false;
		});
	}

	/*
	*/
	processBranches(branches): void {

		// for each repo found create arrays of data needed
		this.repoArray = branches.data.map( (repo, index) => {

			// for each matching dev branch found get list of branches
			return repo.branches.map( devBranch => {
				let selection = {
					allRepos: this.repos.data,
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
			allRepos: this.repos.data,
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

		this.jira.getBranches(repoName).subscribe( branches => {
			this.repoArray[index].allBranches = branches.data;
		});
	}

}
