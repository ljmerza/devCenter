import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetPingsComponent } from './set-pings.component';

describe('SetPingsComponent', () => {
  let component: SetPingsComponent;
  let fixture: ComponentFixture<SetPingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetPingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetPingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
