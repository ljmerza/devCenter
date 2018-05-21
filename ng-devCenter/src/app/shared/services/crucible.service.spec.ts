import { TestBed, inject } from '@angular/core/testing';

import { CrucibleService } from './crucible.service';

describe('CrucibleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CrucibleService]
    });
  });

  it('should be created', inject([CrucibleService], (service: CrucibleService) => {
    expect(service).toBeTruthy();
  }));
});
