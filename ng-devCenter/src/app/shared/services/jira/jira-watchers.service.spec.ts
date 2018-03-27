import { TestBed, inject } from '@angular/core/testing';

import { JiraWatchersService } from './jira-watchers.service';

describe('JiraWatchersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JiraWatchersService]
    });
  });

  it('should be created', inject([JiraWatchersService], (service: JiraWatchersService) => {
    expect(service).toBeTruthy();
  }));
});
