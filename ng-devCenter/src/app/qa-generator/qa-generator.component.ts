import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-qa-generator',
  templateUrl: './qa-generator.component.html',
  styleUrls: ['./qa-generator.component.css']
})
export class QaGeneratorComponent {

  constructor() { }

  @Input() modalInstance;
  @Input() qa_submit_disable;

  heroForm: FormGroup;
}
