import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrucibleCommentsComponent } from './crucible-comments.component';

describe('CrucibleCommentsComponent', () => {
  let component: CrucibleCommentsComponent;
  let fixture: ComponentFixture<CrucibleCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrucibleCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrucibleCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
