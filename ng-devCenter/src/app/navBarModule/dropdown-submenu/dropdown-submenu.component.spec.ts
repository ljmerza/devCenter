import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownSubmenuComponent } from './dropdown-submenu.component';

describe('DropdownSubmenuComponent', () => {
  let component: DropdownSubmenuComponent;
  let fixture: ComponentFixture<DropdownSubmenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownSubmenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownSubmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
