import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevStatsComponent } from './dev-stats.component';

describe('DevStatsComponent', () => {
  let component: DevStatsComponent;
  let fixture: ComponentFixture<DevStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
