import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { PanelComponent } from '@app/panel/components/panel/panel.component';
import { 
  NgForm, FormGroup, FormControl, Validators, 
  FormBuilder, AbstractControl, ValidationErrors, FormArray 
} from '@angular/forms';

@Component({
  selector: 'anms-qa-generator',
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

  constructor(public formBuilder: FormBuilder) { 

    this.qaForm = this.formBuilder.group({
      selections: this.formBuilder.group({
        pcrNeeded: this.formBuilder.control(this.defaultPcrNeeded),
        logTime: this.formBuilder.control(this.defaultLogTime),
      }),
      qaSteps: this.formBuilder.control(''),
      branches: this.formBuilder.array([])
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
