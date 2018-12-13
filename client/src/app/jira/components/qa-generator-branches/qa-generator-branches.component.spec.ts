import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QaGeneratorBranchesComponent } from './qa-generator-branches.component';

describe('QaGeneratorBranchesComponent', () => {
  let component: QaGeneratorBranchesComponent;
  let fixture: ComponentFixture<QaGeneratorBranchesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QaGeneratorBranchesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QaGeneratorBranchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
