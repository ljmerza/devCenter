import { 
	Component, ViewChild, ElementRef, ChangeDetectorRef, ViewEncapsulation, 
	ChangeDetectionStrategy, OnInit, EventEmitter, Output, Input, OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgForm, FormGroup, FormControl, Validators, FormBuilder, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Observable, Subscription } from 'rxjs';
import { select, NgRedux } from '@angular-redux/store';

import { ModalComponent } from '@modal';
import { JiraService, ToastrService, GitService, ConfigService, UserService } from '@services';
import { RootState, Actions } from '@store';
import { statuses, Repo, Ticket, APIResponse } from '@models';

import {showQaSubmitSuccessMessage, showSubmitMessage, checkForStateChange} from './successChecker';
import {processBranches, getTicketBranches, getBranches, addBranch, removeBranch, getBaseBranch} from './branchActions';

@Component({
	selector: 'dc-qa-generator',
	templateUrl: './qa-generator.component.html',
	styleUrls: ['./qa-generator.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class QaGeneratorComponent implements OnInit, OnDestroy {
	loadingBranches:boolean = false; // are we loading branches?
	qaForm;
	hourStep = 1;
	minuteStep = 15;
	modalSize = {
        width: '900px',
        height: () => window.innerHeight/1.3
    };

	repos:Array<Repo>;
	repos$;
	defaultLogTime = {hour: 0, minute: 0};
	defaultPcrNeeded = true;
	gitBranches$;

	@ViewChild(ModalComponent) modal: ModalComponent;
	@Input() msrp;
	@Input() key;
	@Input() crucibleOnly;
	@Output() statusChange = new EventEmitter();

	ticketListType;
	ticket$;
	sprint;
	summary;
	story_point;
	master_branch;

	addBranch;
	removeBranch;
	getBaseBranch;
	checkForStateChange;
	showQaSubmitSuccessMessage;

	constructor(
		public jira:JiraService, private git: GitService, public toastr: ToastrService, 
		private cd: ChangeDetectorRef, public config: ConfigService, public formBuilder: FormBuilder, 
		public user: UserService, private store:NgRedux<RootState>, public route:ActivatedRoute
	) {
		  // create form object
		this.qaForm = this.formBuilder.group({
			selections: this.formBuilder.group({
				pcrNeeded: this.formBuilder.control(this.defaultPcrNeeded),
				logTime: this.formBuilder.control(this.defaultLogTime),
			}),
			qaSteps: this.formBuilder.control(''),
			branches: this.formBuilder.array([])
		});

		// link imported functions
		this.addBranch = addBranch.bind(this);
		this.removeBranch = removeBranch.bind(this);
		this.getBaseBranch = getBaseBranch.bind(this);
		this.checkForStateChange = checkForStateChange.bind(this);
		this.showQaSubmitSuccessMessage = showQaSubmitSuccessMessage.bind(this);
	}

	/**
 	 * watch for store changes of repository list.
	 */
	ngOnInit(){
		this.repos$ = this.store.select('repos').subscribe((repos:Array<Repo>) => this.repos = repos);

		this.route.paramMap.subscribe((routeResponse:any) => {
			this.ticketListType = routeResponse.params.filter || 'mytickets';

			// get ticket sprint
			this.ticket$ = this.store.select(`${this.ticketListType}`)
			.subscribe((allTickets:any=[]) => {
				const ticket = allTickets.find(ticket => ticket.key === this.key) || {};
				this.sprint = (ticket && ticket.sprint) || '';
				this.summary = (ticket && ticket.summary) || '';
				this.story_point = (ticket && ticket.story_point) || 0;
				this.master_branch = (ticket && ticket.master_branch) || 0;
			});

		});
	}

	/**
	 * Unsubscribe from any subscriptions before component exit.
	 */
	ngOnDestroy(){
		if(this.repos$) this.repos$.unsubscribe();
		if(this.ticket$) this.ticket$.unsubscribe();
	}
	
	/**
	* getter for branches array in formGroup
	* @return {FormArray}
	*/
	get branches(): FormArray {
		return this.qaForm.get('branches') as FormArray;
	};

	/**
	 * Submits QA generator form inputs to generate diff and transition Jira ticket to PCR Needed.
	 * @param {boolean} isSaving
	 */
	submitQA(isSaving=false): void {
		if(!this._validSumbission(isSaving)) return;
		
		const postData = this.generatePostBody();
		showSubmitMessage.call(this, postData);
		this.jira.generateQA(postData).subscribe(
			response => {
				if(this.gitBranches$) this.gitBranches$.unsubscribe();

				this.showQaSubmitSuccessMessage(response.data, postData);

				const isPcr = this.qaForm.controls.selections.controls.pcrNeeded.value;
				this.checkForStateChange(postData, response.data, isPcr);

				this._resetForm();
			},
			error => {
				this.jira.processErrorResponse(error);
				this.statusChange.emit({canceled: true, num:6});
			}
		);
	}

	/**
	 *
	 */
	_validSumbission(isSaving){
		const isPcr = this.qaForm.controls.selections.controls.pcrNeeded.value;
		if(!isPcr || !isSaving){
			this.statusChange.emit({canceled: true, hideToast: this.crucibleOnly});
		}

		// cancel and close if not saving form
		if(!isSaving){
			this.modal.closeModal();
			return false;
		}

		if(this.qaForm.invalid) return;
		this.modal.closeModal();

		return true
	}

	/**
	 * Resets forms fields to default values
	 */
	_resetForm(){
		this.qaForm.get('selections').get('pcrNeeded').setValue(this.defaultPcrNeeded);
		this.qaForm.get('selections').get('logTime').setValue(this.defaultLogTime);
		this.qaForm.get('qaSteps').reset();
	}

	/**
	* Generates QA generator POST data
	*/
	generatePostBody(){
		const selections = this.qaForm.controls.selections.controls;
		const branches = this.qaForm.controls.branches.controls

		return {
			qa_steps: this.qaForm.controls.qaSteps.value,
			log_time: selections.logTime.value.hour * 60 + selections.logTime.value.minute,
			autoPCR: selections.pcrNeeded.value,
			key: this.key,
			msrp: this.msrp,
			summary: this.summary,
			story_point: this.story_point,
			sprint: this.sprint,
			master_branch: this.master_branch,
			repos: branches.map(branch => {
				return {
					baseBranch: branch.controls.baseBranch.value,
					repositoryName: branch.controls.repositoryName.value,
					reviewedBranch: branch.controls.reviewedBranch.value
				}
			}),
		};
	}

	/**
	 * Opens the QA generator dialog and starts a search for related branches.
	 */
	openQAModal():void {
		this._resetForm();

		// if only want crucible then set PCR needed to false
		if(this.crucibleOnly) this.qaForm.get('selections').get('pcrNeeded').setValue(false);
		this.cd.detectChanges();
		this.modal.openModal();

		// if we already have branches then don't reload them
		if( (this.qaForm.get('branches') as FormArray).length > 0 ) {
			return;
		}

		getTicketBranches.call(this);
	}

	/**
	 *  stops the auto search for branches
	 */
	stopSearch(){
		if(this.gitBranches$) this.gitBranches$.unsubscribe();
		this.loadingBranches = false;
	}
}