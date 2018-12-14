import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { PanelComponent } from '@app/panel/components/panel/panel.component';
import { 
  NgForm, FormGroup, FormControl, Validators, 
  FormBuilder, AbstractControl, ValidationErrors, FormArray 
} from '@angular/forms';


@Component({
  selector: 'dc-qa-generator',
  templateUrl: './qa-generator.component.html',
  styleUrls: ['./qa-generator.component.css']
})
export class QaGeneratorComponent implements OnInit {

  @ViewChild(PanelComponent) modal: PanelComponent;
  @Input() ticket;
  @Input() profile;

  qaForm: FormGroup;
  defaultLogTime = { hour: 0, minute: 0 };
  defaultPcrNeeded = true;

  constructor(public fb: FormBuilder) { 

    this.qaForm = this.fb.group({
      pcrNeeded: this.fb.control(this.defaultPcrNeeded),
      logTime: this.fb.control(this.defaultLogTime),
      qaSteps: this.fb.control(''),
      repos: this.fb.array([])
    });
  }

  ngOnInit() {
  }

  closeModal(){
    this.modal.closeModal();
  }

  openModal() {
    this.modal.openModal();
  }

}
