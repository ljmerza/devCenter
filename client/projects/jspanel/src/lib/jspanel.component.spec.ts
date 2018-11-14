import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JspanelComponent } from './jspanel.component';

describe('JspanelComponent', () => {
  let component: JspanelComponent;
  let fixture: ComponentFixture<JspanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JspanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JspanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
