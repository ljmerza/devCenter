import { Component, ViewChild, ElementRef, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy,	EventEmitter, Output, Input } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators, FormBuilder, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { NgbModalRef, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

import { ModalComponent } from './../../shared/modal/modal.component';
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';
import { ConfigService } from './../../shared/services/config.service'
import { UserService } from './../../shared/services/user.service'
import { GitService } from './../../shared/services/git.service';

import { NgRedux } from '@angular-redux/store';
import { RootState } from './../../shared/store/store';
import { Actions } from './../../shared/store/actions';
import { STATUSES } from './../../shared/store/models/ticket-statuses';

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

	@Input() msrp;
	@Input() key;
	@Input() repos;
	customModalCss = 'qaGen';

	constructor(public jira:JiraService, public toastr: ToastrService, private cd: ChangeDetectorRef, public config: ConfigService, public formBuilder: FormBuilder, public user: UserService, private git: GitService, private store:NgRedux<RootState>) {
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

	/**
	 * getter for branches aray in formGroup
	 * @return {FormArray}
	 */
	get branches(): FormArray {
		return this.qaForm.get('branches') as FormArray;
	};

	/**
	 * Adds a new branch to the branches form array. Adds subscription to
	 * value change on repository selection to get all branches for that repository.
	 * @param {Object} the new branch object to add to the ngForm
	 */
	addBranch(newBranch){
		let repositoryName = this.formBuilder.control(newBranch.repositoryName || '');

		const branch = this.formBuilder.group({
			allRepos: this.formBuilder.array(this.repos.map(repo => repo.name)),
			allBranches: this.formBuilder.array(newBranch.allBranches || []),
			allBranchedFrom: this.formBuilder.array(newBranch.allBranches || []),
			repositoryName,
			reviewedBranch: this.formBuilder.control(newBranch.reviewedBranch || ''),
			baseBranch: this.formBuilder.control(newBranch.baseBranch || '')
		});

		repositoryName.valueChanges.subscribe(repoName => this.getBranches(repoName, branch));
		(this.qaForm.get('branches') as FormArray).push(branch);
	}

	/**
	 * gets a repository's branch list and adds it to the corresponding branch form control.
	 * @param {string} repoName the name of the repository
	 * @param {FormControl} branch 
	 */
	 getBranches(repoName, branch) {
			this.git.getBranches(repoName).subscribe( 
				branches => branch.setControl('allBranches', this.formBuilder.array(branches.data.length > 0 ? branches.data:[])),
				error => this.toastr.showToast(this.git.processErrorResponse(error), 'error')
			);
		}

	/**
	 * removes a branch from the branch form array.
	 * @param {number} branchIndex the index of the branch to remove from the array.
	 */
	removeBranch(branchIndex:number): void {
		(this.qaForm.get('branches') as FormArray).removeAt(branchIndex);
	}

	/*
	*/
	submitQA(isSaving): void {

		if(!isSaving){
			this.cancelStatusChange();
			this.modalRef.close();
			return;
		}

		if(this.qaForm.invalid) return;
		this.modalRef.close();
		
		const postData = this.generatePostBody();
		if(!postData.autoPCR) this.cancelStatusChange();
		this.showSubmitMessage(postData);

		this.jira.generateQA(postData).subscribe(
			response => {
				this.showQaSubmitSuccessMessage(response);
				this.checkForStateChange(postData, response.data);
			},
			error => {
				this.jira.processErrorResponse(error);
				this.cancelStatusChange();
			}
		);
	}

	/**
	*/
	cancelStatusChange(){
		this.store.dispatch({type: Actions.updateStatus, payload:{ key:this.key, status: STATUSES.INDEV }});
		this.toastr.showToast(`Ticket ${this.key} status cancelled.`, 'info');
	}

	/**
	*/
	showSubmitMessage(postData):void {
		// create info message based on form selections
		let message = [];
		if(postData.repos.length > 0) message.push('creating Crucible');
		if(postData.qa_steps) message.push('adding comment to Jira');
		if(postData.autoPCR) message.push('transitioning to PCR Needed');

		// create info message and display
		if(message.length > 1) message[message.length-1] = 'and ' + message[message.length-1];
		const joiner = message.length > 2 ? ', ' : ' ';
		this.toastr.showToast(message.join(joiner), 'info');
	}

	/**
	* Generates QA generator POST data
	*/
	generatePostBody(){
		const selections = this.qaForm.controls.selections.controls;
		const branches = this.qaForm.controls.branches.controls

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

		return postData;
	}

	/**
	*/
	showQaSubmitSuccessMessage(response){
		let toastMessage = `<a target="_blank" href='${this.config.jiraUrl}/browse/${this.key}'>Jira Link</a>`;
		
		if(response.data.crucible_id){
			toastMessage += `<br><a target="_blank" href='${this.config.crucibleUrl}/cru/${response.data.crucible_id}'>Crucible Link</a>`
		}
		this.toastr.showToast(toastMessage, 'success', true);
	}

	/**
	 * checks for any state changes such as ticket status, crucible ids added, and added comments.
	 * @param {Object} postData the data used in the POST call to QA generator endpoint.
	 * @param {Object} response_data the data in the response from the QA generator endpoint.
	 */
	checkForStateChange(postData, response_data):void {

		console.log('response_data: ', response_data);
		if(response_data.comment_response.status) {
			this.store.dispatch({type: Actions.addComment, payload:{ key:this.key, comment: response_data.comment_response.data }});
		}

		// check for status changes okay
		if(response_data.cr_response.status && response_data.pcr_response.status) {
			this.store.dispatch({type: Actions.updateStatus, payload:{ key:this.key, status: STATUSES.PCRNEED }});
		} else {
			const cr_message = response_data.cr_response.status ? '' : 'Code Review status change';
			const pcr_message = response_data.pcr_response.status ? '' : 'PCR Needed component change';
			this.toastr.showToast('error', 'The following transitions failed: ${cr_message} ${pcr_message}');
		}

		if(response_data.cru_response.status) {
			this.store.dispatch({type: Actions.updateCrucible, payload:{ key:this.key, cruid: response_data.cru_response.data }});
		}
	}

	/*
	*/
	openQAModal():void {
		this.cd.detectChanges();
		this.modalRef = this.modal.openModal();

		// if we already have branches then don't reload them
		if( (this.qaForm.get('branches') as FormArray).length > 0 ) {
			return;
		}

		this.loadingBranches = true;
		this.cd.detectChanges();

		// get all branches associated with this msrp
		this.repoLookUp$ = this.git.getTicketBranches(this.msrp).subscribe(
			response => {
				this.loadingBranches = false;
				this.processBranches(response.data);
				this.cd.detectChanges();
			},
			error => {
				this.loadingBranches = false;
				this.toastr.showToast(this.jira.processErrorResponse(error), 'error');
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
				let baseBranch;
				if(repo.repo === 'external_modules') baseBranch = ['dev'];
				else baseBranch = this.getBaseBranch(repo.all);

				return {
					allRepos: this.repos,
					allBranches: repo.all,
					repositoryName: repo.repo,
					reviewedBranch: devBranch,
					baseBranch: baseBranch.length == 1 ? baseBranch[0] : ''
				};
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