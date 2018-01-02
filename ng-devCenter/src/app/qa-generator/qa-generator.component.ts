import { 
	Component, ViewChild, ElementRef, 
	ViewEncapsulation, ChangeDetectionStrategy,
	EventEmitter, Output, Input
} from '@angular/core';

import { NgbModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { 
	NgForm,FormGroup, FormControl, Validators, FormBuilder,
	AbstractControl, ValidationErrors, FormArray
} from '@angular/forms';

import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';
import { ConfigService } from './../services/config.service'

@Component({
	selector: 'app-qa-generator',
	templateUrl: './qa-generator.component.html',
	styleUrls: ['./qa-generator.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class QaGeneratorComponent {
	modalReference; // reference to open modal
	loadingBranches:boolean = true; // are we loading branches?
	repoLookUp$;
	qaForm;

	hourStep = 1;
	minuteStep = 15;
	repoArray = [];
	branches; // loaded branches data

	@ViewChild('qaModal') content:ElementRef;
	@Output() statusChange = new EventEmitter();
	@Input() msrp;
	@Input() key;
	@Input() repos;

	constructor(
		public jira:JiraService, 
		private modalService:NgbModal, 
		public toastr: ToastrService, 
		public config: ConfigService,
		private fb: FormBuilder
	) {
		this.qaForm = fb.group({
			selections: fb.group({
				pcrNeeded: new FormControl(),
				codeReview: new FormControl(),
				logTime: new FormControl({hour: 0, minute: 0}),
			}),
			qaSteps: new FormControl(),
			branches: fb.array([])
		});
	}

	/*
	*/
	addBranch(newBranch){
		const branch = new FormGroup({
			allRepos: this.fb.array(this.repos),
			allBranches: this.fb.array(newBranch.allBranches || []),
			repositoryName: new FormControl(newBranch.repositoryName || ''),
			reviewedBranch: new FormControl(newBranch.reviewedBranch || ''),
			baseBranch: new FormControl(newBranch.baseBranch || '')
		});

		(this.qaForm.get('branches') as FormArray).push(branch);
	}

	/*
	*/
	removeBranch(branchIndex:number): void {
		// if only one left cant delete
		if((this.qaForm.get('branches') as FormArray).length == 1){
			this.toastr.showToast('Must have at least one repo.', 'error');
			return;
		}

		(this.qaForm.get('branches') as FormArray).removeAt(branchIndex);
	}

	/*
	*/
	submitQA(isSaving): void {
		// close modal
		this.modalReference.close();

		// end here if we are just closing modal
		if(!isSaving){
			return;
		}

		console.log('qaForm: ', this.qaForm);

		// create POST data structure
		// let postData = {
		// 	qa_steps: formObj.value.qaSteps,
		// 	log_time: formObj.value.logTime.hour * 60 + formObj.value.logTime.minute,
		// 	autoCR: formObj.value.codeReview,
		// 	autoPCR: formObj.value.pcrNeeded,
		// 	key: this.key,
		// 	repos: this.repoArray,
		// 	msrp: this.msrp
		// };

		// // show informational toast
		// if(!formObj.value.qaSteps){
		// 	this.toastr.showToast('Creating Crucible but not updating to Jira', 'info');
		// 	this.statusChange.emit({cancelled: true, showMessage: false});
		// } else {
		// 	this.toastr.showToast('Creating Crucible and updating Jira', 'info');
		// }

		// // send POST request and notify results
		// this.jira.generateQA(postData).subscribe(
		// 	response => {
		// 		this.toastr.showToast(`
		// 			<a target="_blank" href='${this.config.jiraUrl}/browse/${this.key}'>Jira Link</a>
		// 			<br>
		// 			<a target="_blank" href='${this.config.crucibleUrl}/cru/${response.data}'>Crucible Link</a>
		// 		`, 'success', true);

		// 		// only update status if we are updating Jira
		// 		if(formObj.value.qaSteps){
		// 			this.statusChange.emit({cancelled: false, showMessage: false});
		// 		}
				
		// 	},
		// 	error => {
		// 		this.toastr.showToast(this.jira.processErrorResponse(error), 'error');
				
		// 		// only update status if we are updating Jira
		// 		if(formObj.value.qaSteps){
		// 			this.statusChange.emit({cancelled: true, showMessage: true});
		// 		}
		// 	}
		// );
	}

	/*
	*/
	openQAModal(): void {

		// open modal
		this.modalReference = this.modalService
		.open(this.content, { windowClass: 'qa-modal' });

		this.modalReference.result.then(
			() => null,
			() => {
				// cancel repo look up and status change in UI
				if(this.repoLookUp$){
					this.repoLookUp$.unsubscribe();
				}
				this.statusChange.emit({cancelled: true, showMessage: true});
			}
		);

		// disabled submit button for QA gen
		this.loadingBranches = true;

		// get all branches associated with this msrp
		this.repoLookUp$ = this.jira.getTicketBranches(this.msrp).subscribe(
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

		branches.forEach( (repo, index) => {

			// for each matching dev branch found get list of branches
			const newBranch = repo.branches.map( devBranch => {
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


			this.addBranch(newBranch);
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
	deleteDevBranch(idx:number): void {
		// if only one left cant delete
		if(this.repoArray.length == 1){
			this.toastr.showToast('Must have at least one repo.', 'error');
			return;
		}

		this.repoArray.splice(idx,1);
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
