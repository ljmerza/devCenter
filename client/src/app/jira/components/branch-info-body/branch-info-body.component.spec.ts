import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchInfoBodyComponent } from './branch-info-body.component';

describe('BranchInfoBodyComponent', () => {
  let component: BranchInfoBodyComponent;
  let fixture: ComponentFixture<BranchInfoBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BranchInfoBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchInfoBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
