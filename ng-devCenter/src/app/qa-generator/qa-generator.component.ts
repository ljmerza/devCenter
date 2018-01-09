import { 
	Component, ViewChild, ElementRef, 
	ViewEncapsulation, ChangeDetectionStrategy,
	EventEmitter, Output, Input
} from '@angular/core';

import { NgbModalRef, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { 
	NgForm, FormGroup, FormControl, Validators, FormBuilder,
	AbstractControl, ValidationErrors, FormArray
} from '@angular/forms';

import { ModalComponent } from './../modal/modal.component';
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
	loadingBranches:boolean = false; // are we loading branches?
	repoLookUp$;
	qaForm;

	hourStep = 1;
	minuteStep = 15;


	@ViewChild(ModalComponent) modal: ModalComponent;
	modalRef: NgbModalRef;

	@Output() statusChange = new EventEmitter();
	@Input() msrp;
	@Input() key;
	@Input() repos;
	customModalCss;

	constructor(
		public jira:JiraService, public toastr: ToastrService, 
		public config: ConfigService,public formBuilder: FormBuilder
	) {
		// create form object
		this.qaForm = this.formBuilder.group({
			selections: this.formBuilder.group({
				pcrNeeded: this.formBuilder.control(true),
				codeReview: this.formBuilder.control(true),
				logTime: this.formBuilder.control({hour: 0, minute: 0}),
			}),
			qaSteps: this.formBuilder.control(''),
			branches: this.formBuilder.array([])
		});

		this.customModalCss = 'qaGen';
	}

	/*
	*/
	get branches(): FormArray {
		return this.qaForm.get('branches') as FormArray;
	};

	/*
	*/
	addBranch(newBranch){

		// create repo name control
		let repositoryName = this.formBuilder.control(newBranch.repositoryName || '');

		// create repo branch group
		const branch = this.formBuilder.group({
			allRepos: this.formBuilder.array(this.repos.map(repo => repo.name)),
			allBranches: this.formBuilder.array(newBranch.allBranches || []),
			allBranchedFrom: this.formBuilder.array(newBranch.allBranches || []),
			repositoryName,
			reviewedBranch: this.formBuilder.control(newBranch.reviewedBranch || ''),
			baseBranch: this.formBuilder.control(newBranch.baseBranch || '')
		});

		// on repo change get all branches of repo and set on FormGroup
		repositoryName.valueChanges.subscribe(repoName => {
			this.jira.getBranches(repoName).subscribe( 
				branches => branch.setControl('allBranches', this.formBuilder.array(branches.data.length > 0 ? branches.data:[])),
				error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
			);
		});

		// add new branch to branches array
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
	resetBranches(){
		// reset branches array to empty
		let branches = (this.qaForm.get('branches') as FormArray);
		while (branches.length) {
		    branches.removeAt(branches.length - 1);
		}
	}

	/*
	*/
	submitQA(isSaving): void {

		if(this.loadingBranches) return;

		// if we are currently looking for repos then cancel that search
		if(this.repoLookUp$) this.repoLookUp$.unsubscribe();

		// end here if we are just closing modal
		if(!isSaving){
			this.statusChange.emit({cancelled: true, showMessage: true});
			this.resetBranches();
			this.modalRef.close();
			return;

		} else if(this.qaForm.invalid){
			// make sure entire form is valid
			this.statusChange.emit({cancelled: true, showMessage: true});
			return;
		}

		// close modal since we dont need it anymore
		this.modalRef.close();

		// get selections sub formGroup and branches sub formArray
		const selections = this.qaForm.controls.selections.controls;
		const branches = this.qaForm.controls.branches.controls

		// create POST data structure
		let postData = {
			qa_steps: this.qaForm.controls.qaSteps.value,
			log_time: selections.logTime.value.hour * 60 + selections.logTime.value.minute,
			autoCR: selections.codeReview.value,
			autoPCR: selections.pcrNeeded.value,
			key: this.key,
			msrp: this.msrp,
			repos: branches.map(branch => {
				return {
					baseBranch: branch.controls.baseBranch.value,
					repositoryName: branch.controls.repositoryName.value,
					reviewedBranch: branch.controls.reviewedBranch.value
				}
			}),
		};

		// show informational toast
		if(!postData.qa_steps){
			this.toastr.showToast('Creating Crucible but not updating to Jira', 'info');
			this.statusChange.emit({cancelled: true, showMessage: false});
		} else {
			this.toastr.showToast('Creating Crucible and updating Jira', 'info');
		}

		// send POST request and notify results
		this.jira.generateQA(postData).subscribe(
			response => {
				this.toastr.showToast(`
					<a target="_blank" href='${this.config.jiraUrl}/browse/${this.key}'>Jira Link</a>
					<br>
					<a target="_blank" href='${this.config.crucibleUrl}/cru/${response.data}'>Crucible Link</a>
				`, 'success', true);

				// reset branch list
				this.resetBranches();

				// only update status if we are updating Jira
				if(postData.qa_steps){
					this.statusChange.emit({cancelled: false, showMessage: false});
				}
				
			},
			error => {
				this.toastr.showToast(this.jira.processErrorResponse(error), 'error');
				
				// only update status if we are updating Jira
				if(postData.qa_steps){
					this.statusChange.emit({cancelled: true, showMessage: true});
				}
			}
		);
	}

	/*
	*/
	openQAModal(): void {
		// open modal
		setTimeout( () => {
			this.modalRef = this.modal.openModal();
		});

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
}
