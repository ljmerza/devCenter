import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QaGeneratorComponent } from './qa-generator.component';

describe('QaGeneratorComponent', () => {
  let component: QaGeneratorComponent;
  let fixture: ComponentFixture<QaGeneratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QaGeneratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QaGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
