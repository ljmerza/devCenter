import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrucibleCommentsModalComponent } from './crucible-comments-modal.component';

describe('CrucibleCommentsModalComponent', () => {
  let component: CrucibleCommentsModalComponent;
  let fixture: ComponentFixture<CrucibleCommentsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrucibleCommentsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrucibleCommentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
