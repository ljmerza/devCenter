import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { 
   NgForm, FormGroup, FormControl, Validators, 
   FormBuilder, AbstractControl, ValidationErrors, FormArray 
} from '@angular/forms';
  
import { PanelComponent } from '@app/panel/components/panel/panel.component';
import { QaGeneratorBranchesComponent } from '../qa-generator-branches/qa-generator-branches.component';
import { StatusTicket } from '@app/jira/models';
import { ActionStatusQaSave } from '../../actions';

@Component({
  selector: 'dc-qa-generator',
  templateUrl: './qa-generator.component.html',
  styleUrls: ['./qa-generator.component.css']
})
export class QaGeneratorComponent {

  @ViewChild(PanelComponent) modal: PanelComponent;
  @ViewChild(QaGeneratorBranchesComponent) branchesComponent: QaGeneratorBranchesComponent;
  @Input() ticket: StatusTicket;
  @Input() profile;

  @Output() cancel = new EventEmitter();

  qaForm: FormGroup;
  logTime = { hour: 0, minute: 0 };
  hourStep: number = 1;
  minuteStep: number = 15;

  constructor(public fb: FormBuilder, public store: Store<{}>) { 

    this.qaForm = this.fb.group({
      logTime: this.fb.control(this.logTime),
      qaSteps: this.fb.control(''),
      repos: this.fb.array([])
    });
  }

  get selectedRepos(): FormArray {
    return this.qaForm.get('repos') as FormArray;
  };

  /**
   * cancel status and close qa modal
   */
  cancelGenerator(){
    this.resetForm();
    this.modal.closeModal();
    this.cancel.emit();
    this.branchesComponent.getRepos$ && this.branchesComponent.getRepos$.unsubscribe();
  }

  /**
   * open modal and call get ticket branches (wait for modal to render)
   */
  openModal() {
    this.modal.openModal();
    
    // if we have no branches selected then try to auto get them
    setTimeout(() => {
      if (!this.selectedRepos.length) {
        this.branchesComponent.getTicketBranches.bind(this.branchesComponent)();
      }
    });
  }

  /**
   * get form values and submit to qa generator
   */
  onSubmit(){
    const { logTime={}, qaSteps='', repos=[] } = this.qaForm.value;

    const payload = {
      pcr_ready: true,
      key: this.ticket.key,
      log_time: (logTime.hour || 0) * 60 + (logTime.minute || 0),
      logTime,
      master_branch: this.ticket.repoName,
      msrp: this.ticket.msrp,
      qa_steps: qaSteps,
      repos: repos.map(repo => ({ baseBranch: repo.allBranchedFromChoice, repositoryName: repo.allReposChoice, reviewedBranch: repo.allBranchesChoice})),
      sprint: this.ticket.sprint,
      story_point: this.ticket.storyPoint,
      summary: this.ticket.summary,
    }

    this.store.dispatch(new ActionStatusQaSave(payload));
    this.modal.closeModal();
    this.resetForm();
  }

  /**
   * leave repos intact but clear everything else
   */
  resetForm(){
    this.qaForm.patchValue({ logTime: this.logTime, qaSteps: '' });
  }
}
