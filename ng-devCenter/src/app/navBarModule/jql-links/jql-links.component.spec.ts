import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JqlLinksComponent } from './jql-links.component';

describe('JqlLinksComponent', () => {
  let component: JqlLinksComponent;
  let fixture: ComponentFixture<JqlLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JqlLinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JqlLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
