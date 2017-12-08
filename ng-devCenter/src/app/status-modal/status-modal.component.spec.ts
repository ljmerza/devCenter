import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PcrModalComponent } from './pcr-modal.component';

describe('PcrModalComponent', () => {
  let component: PcrModalComponent;
  let fixture: ComponentFixture<PcrModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PcrModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PcrModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
