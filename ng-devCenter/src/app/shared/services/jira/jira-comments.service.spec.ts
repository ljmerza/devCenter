import { TestBed, inject } from '@angular/core/testing';

import { JiraCommentsService } from './jira-comments.service';

describe('JiraCommentsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JiraCommentsService]
    });
  });

  it('should be created', inject([JiraCommentsService], (service: JiraCommentsService) => {
    expect(service).toBeTruthy();
  }));
});
