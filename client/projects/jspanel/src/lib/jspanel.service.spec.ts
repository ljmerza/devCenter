import { TestBed } from '@angular/core/testing';

import { JspanelService } from './jspanel.service';

describe('JspanelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JspanelService = TestBed.get(JspanelService);
    expect(service).toBeTruthy();
  });
});
