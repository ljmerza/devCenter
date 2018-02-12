import { TestBed, inject } from '@angular/core/testing';

import { JiraPingsService } from './jira-pings.service';

describe('JiraPingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JiraPingsService]
    });
  });

  it('should be created', inject([JiraPingsService], (service: JiraPingsService) => {
    expect(service).toBeTruthy();
  }));
});
