import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketCommentsModalComponent } from './ticket-comments-modal.component';

describe('TicketCommentsModalComponent', () => {
  let component: TicketCommentsModalComponent;
  let fixture: ComponentFixture<TicketCommentsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketCommentsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketCommentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
