import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraCommentsComponent } from './jira-comments.component';

describe('JiraCommentsComponent', () => {
  let component: JiraCommentsComponent;
  let fixture: ComponentFixture<JiraCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JiraCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JiraCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
