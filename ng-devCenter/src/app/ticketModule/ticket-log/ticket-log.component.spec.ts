import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketLogComponent } from './ticket-log.component';

describe('TicketLogComponent', () => {
  let component: TicketLogComponent;
  let fixture: ComponentFixture<TicketLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
