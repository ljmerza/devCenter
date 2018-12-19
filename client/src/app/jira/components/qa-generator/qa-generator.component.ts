import {
  Component, OnInit, ViewChild, Input, Output, EventEmitter
 } from '@angular/core';
import { PanelComponent } from '@app/panel/components/panel/panel.component';
import { 
  NgForm, FormGroup, FormControl, Validators, 
  FormBuilder, AbstractControl, ValidationErrors, FormArray 
} from '@angular/forms';

import { QaGeneratorBranchesComponent } from '../qa-generator-branches/qa-generator-branches.component'

@Component({
  selector: 'dc-qa-generator',
  templateUrl: './qa-generator.component.html',
  styleUrls: ['./qa-generator.component.css']
})
export class QaGeneratorComponent implements OnInit {

  @ViewChild(PanelComponent) modal: PanelComponent;
  @ViewChild(QaGeneratorBranchesComponent) branchesComponent: QaGeneratorBranchesComponent;
  @Input() ticket;
  @Input() profile;

  @Output() cancel = new EventEmitter();

  qaForm: FormGroup;
  pcrNeeded = true;
  logTime = { hour: 0, minute: 0 };
  hourStep: number = 1;
  minuteStep: number = 15;

  constructor(public fb: FormBuilder) { 

    this.qaForm = this.fb.group({
      pcrNeeded: this.fb.control(this.pcrNeeded),
      logTime: this.fb.control(this.logTime),
      qaSteps: this.fb.control(''),
      repos: this.fb.array([])
    });
  }

  ngOnInit() {
  }

  get selectedRepos(): FormArray {
    return this.qaForm.get('repos') as FormArray;
  };

  /**
   * 
   */
  cancelGenerator(){
    this.modal.closeModal();
    this.cancel.emit();
    this.branchesComponent.getRepos$ && this.branchesComponent.getRepos$.unsubscribe();
  }

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
   * 
   */
  onSubmit(){
    console.log(this.qaForm);
  }

}
