import { 
	Component, ViewChild, ElementRef, ChangeDetectorRef,
	ViewEncapsulation, ChangeDetectionStrategy,
	EventEmitter, Output, Input
} from '@angular/core';

import { NgbModalRef, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { 
	NgForm, FormGroup, FormControl, Validators, FormBuilder,
	AbstractControl, ValidationErrors, FormArray
} from '@angular/forms';

import { ModalComponent } from './../../shared/modal/modal.component';
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';
import { ConfigService } from './../../shared/services/config.service'
import { UserService } from './../../shared/services/user.service'

@Component({
	selector: 'dc-qa-generator',
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
	@Output() commentChangeEvent = new EventEmitter();
	@Input() msrp;
	@Input() key;
	@Input() repos;
	customModalCss = 'qaGen';

	constructor(
		public jira:JiraService, public toastr: ToastrService, private cd: ChangeDetectorRef,
		public config: ConfigService, public formBuilder: FormBuilder, public user: UserService
	) {
		// create form object
		this.qaForm = this.formBuilder.group({
			selections: this.formBuilder.group({
				pcrNeeded: this.formBuilder.control(true),
				logTime: this.formBuilder.control({hour: 0, minute: 0}),
			}),
			qaSteps: this.formBuilder.control(''),
			branches: this.formBuilder.array([])
		});
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
		(this.qaForm.get('branches') as FormArray).removeAt(branchIndex);
	}

	/*
	*/
	submitQA(isSaving): void {

		// end here if we are just closing modal
		if(!isSaving){

			// notify of status cancel and reset branches
			this.statusChange.emit({cancelled: true, showMessage: true});

			// close modal and end here
			this.modalRef.close();
			return;
		}

		// if invalid form then just return
		if(this.qaForm.invalid) return;

		// close modal since we dont need it anymore
		this.modalRef.close();

		// get selections sub formGroup and branches sub formArray
		const selections = this.qaForm.controls.selections.controls;
		const branches = this.qaForm.controls.branches.controls

		// create POST data structure
		let postData = {
			qa_steps: this.qaForm.controls.qaSteps.value,
			log_time: selections.logTime.value.hour * 60 + selections.logTime.value.minute,
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

		// if not transitioning status then cancel status on ticket 
		if(!selections.pcrNeeded.value) {
			this.statusChange.emit({cancelled: true, showMessage: false});
		}

		// create info message based on form selections
		let message = [];
		if(postData.repos.length > 1) message.push('Creating Crucible');
		if(postData.qa_steps) message.push('adding comment to Jira');
		if(selections.pcrNeeded.value) message.push('transitioning to PCR Needed');

		// create info message and display
		if(message.length > 1) message[message.length-1] = 'and ' + message[message.length-1];
		const joiner = message.length > 2 ? ', ' : ' ';
		this.toastr.showToast(message.join(joiner), 'info');

		// send POST request and notify results
		this.jira.generateQA(postData).subscribe(
			response => {

				// create and show toast message
				let toastMessage = `<a target="_blank" href='${this.config.jiraUrl}/browse/${this.key}'>Jira Link</a>`;
				if(response.data.crucible_id){
					toastMessage += `<br><a target="_blank" href='${this.config.crucibleUrl}/cru/${response.data.crucible_id}'>Crucible Link</a>`
				}
				this.toastr.showToast(toastMessage, 'success', true);

				// if qa steps given trigger comment change event
				if(postData.qa_steps){
					// update comments on ticket
					this.commentChangeEvent.emit({response});
				}

				// if status given then trigger status change
				if(selections.pcrNeeded.value){
					this.commentChangeEvent.emit({newStatus: 'PCR - Needed'});
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
		// detect css input changes then open modal
		this.cd.detectChanges();
		this.modalRef = this.modal.openModal();

		this.modalRef.result.then(
    		() => null,
    		() => this.statusChange.emit({showMessage:true, cancelled:true})
    	)

		// if we already have branches then don't reload them
		if( (this.qaForm.get('branches') as FormArray).length > 0 ) {
			return;
		}

		// disabled submit button for QA gen
		this.loadingBranches = true;
		this.cd.detectChanges();

		// get all branches associated with this msrp
		this.repoLookUp$ = this.jira.getTicketBranches(this.msrp).subscribe(
			response => {
				this.loadingBranches = false;
				this.processBranches(response.data);

				// manually tell Angular of change
				this.cd.detectChanges();
			},
			error => {
				this.loadingBranches = false;
				this.toastr.showToast(this.jira.processErrorResponse(error), 'error');

				// manually tell Angular of change
				this.cd.detectChanges();
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
